package main

import (
	"encoding/json"
	"main/services"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type ScraperReq struct {
	Links   []string `json:"links"`
	Filter  []string `json:"filter"`
	Pattern string   `json:"pattern"`
	Timeout uint     `json:"timeout"`
}

type KeywordReq struct {
	Input  string `json:"input"`
	Amount int    `json:"amount"`
}

func main() {

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowHeaders:     "Origin,Content-Type,Accept,Content-Length,Accept-Language,Accept-Encoding,Connection,Access-Control-Allow-Origin",
		AllowOrigins:     "*",
		AllowCredentials: true,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
	}))

	app.Post("/linkscraper", func(c *fiber.Ctx) error {

		var bodyData ScraperReq

		err := json.Unmarshal(c.Body(), &bodyData)
		if err != nil {
			return err
		}

		matches := services.AsycScraper(bodyData.Links, bodyData.Filter, bodyData.Pattern, bodyData.Timeout)

		return c.JSON(fiber.Map{"matches": matches})
	})

	app.Post("/keywords", func(c *fiber.Ctx) error {

		var bodyData KeywordReq

		err := json.Unmarshal(c.Body(), &bodyData)
		if err != nil {
			return err
		}

		keywords, err := services.GenerateKeywords(bodyData.Input, bodyData.Amount)
		if err != nil {
			return err
		}

		if len(keywords) == 0 {
			words := strings.Split(bodyData.Input, " ")
			services.GenerateCombinations(words, 0, []string{}, &keywords)
		}

		return c.JSON(fiber.Map{"keywords": keywords})
	})

	app.Listen("localhost:5500")
}
