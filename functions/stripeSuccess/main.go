package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"os"

	stripe "github.com/stripe/stripe-go/v81"
	stripeSession "github.com/stripe/stripe-go/v81/checkout/session"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/user"
)

const PRO_TIER_NAME = "pro"
const PRO_LIFETIME_TIER_NAME = "pro-lifetime"

type StripeSuccessRequest struct {
	StripeSessionId string `json:"stripeSessionId"`
	Product         string `json:"product"`
}

type ResponseData struct {
	Success      bool   `json:"success"`
	Email        string `json:"email,omitempty"`
	TempPassword string `json:"tempPassword,omitempty"`
}

func generateTempPassword() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		log.Printf("Error generating random bytes: %v", err)
		return "codevideo_default"
	}
	return "codevideo_" + hex.EncodeToString(b)
}

func handler(req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if req.HTTPMethod != "POST" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusMethodNotAllowed,
			Body:       "Method Not Allowed",
		}, nil
	}

	var payload StripeSuccessRequest
	if err := json.Unmarshal([]byte(req.Body), &payload); err != nil {
		log.Printf("Error parsing request: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "Bad Request",
		}, nil
	}

	apiKey := os.Getenv("CLERK_SECRET_KEY")
	if apiKey == "" {
		log.Println("CLERK_SECRET_KEY not set")
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Server Error",
		}, nil
	}
	config := &clerk.ClientConfig{}
	config.Key = &apiKey
	client := user.NewClient(config)

	var tempPassword string
	var clerkUserId string

	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeKey == "" {
		log.Fatalf("STRIPE_SECRET_KEY not set")
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Server Error",
		}, nil
	}
	stripe.Key = stripeKey

	session, err := stripeSession.Get(payload.StripeSessionId, nil)
	if err != nil {
		log.Printf("Error retrieving stripe session: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Error retrieving stripe session",
		}, nil
	}
	if session.CustomerDetails == nil || session.CustomerDetails.Email == "" {
		log.Println("Stripe session missing customer email")
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "No customer email found",
		}, nil
	}

	var newUserCreated = false
	users, err := client.List(context.Background(), &user.ListParams{
		EmailAddresses: []string{session.CustomerDetails.Email},
	})
	if err != nil {
		log.Printf("Error fetching user: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Error fetching user",
		}, nil
	}
	if users.TotalCount > 0 {
		clerkUserId = users.Users[0].ID
	}

	if clerkUserId == "" {
		newUserCreated = true
		tempPassword = generateTempPassword()

		createParams := user.CreateParams{
			EmailAddresses: &[]string{session.CustomerDetails.Email},
			Password:       &tempPassword,
		}
		newUser, err := client.Create(context.Background(), &createParams)
		if err != nil {
			log.Printf("Error creating new Clerk user: %v", err)
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
				Body:       "Error creating user",
			}, nil
		}
		clerkUserId = newUser.ID
	}

	clerkUser, err := client.Get(context.Background(), clerkUserId)
	if err != nil {
		log.Printf("Error fetching user: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Error fetching user",
		}, nil
	}

	newMetadata := make(map[string]interface{})
	newMetadata["stripeId"] = payload.StripeSessionId

	switch payload.Product {
	case PRO_TIER_NAME:
		newMetadata["tier"] = PRO_TIER_NAME
		newMetadata["subscriptionActive"] = true
	case PRO_LIFETIME_TIER_NAME:
		newMetadata["tier"] = PRO_LIFETIME_TIER_NAME
		newMetadata["subscriptionActive"] = true
	default:
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "Unknown product type",
		}, nil
	}

	metaJSON, err := json.Marshal(newMetadata)
	if err != nil {
		log.Printf("Error marshaling metadata: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Server Error",
		}, nil
	}
	updateParams := user.UpdateMetadataParams{
		PublicMetadata: (*json.RawMessage)(&metaJSON),
	}
	if _, err := client.UpdateMetadata(context.Background(), clerkUserId, &updateParams); err != nil {
		log.Printf("Error updating metadata: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Error updating metadata",
		}, nil
	}

	respData := ResponseData{
		Success: true,
	}
	if newUserCreated {
		respData.Email = clerkUser.EmailAddresses[0].EmailAddress
		respData.TempPassword = tempPassword
	}

	respJSON, err := json.Marshal(respData)
	if err != nil {
		log.Printf("Error marshaling response: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "Server Error",
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(respJSON),
	}, nil
}

func main() {
	lambda.Start(handler)
}
