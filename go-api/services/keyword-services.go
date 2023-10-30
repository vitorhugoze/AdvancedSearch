package services

import (
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

type CompleteSuggestion struct {
	Suggestion struct {
		Data string `xml:"data,attr"`
	} `xml:"suggestion"`
}

type TopLevel struct {
	CompleteSuggestions []CompleteSuggestion `xml:"CompleteSuggestion"`
}

func GenerateKeywords(input string, amount int) ([]string, error) {

	start := time.Now()

	wg := sync.WaitGroup{}
	wg.Add(1)

	keyChan := make(chan string)
	defer close(keyChan)

	var keywords []string

	go func(i string, c *chan string) {

		for len(keywords) < amount {

			if start.Add(time.Second * time.Duration(10)).Before(time.Now()) {
				break
			}

			if len(keywords) == 0 {
				err := GetKeywords(i, c)
				if err != nil {
					break
				}
			} else {

				lenAux := len(keywords) - 1
				var startRange int

				if lenAux < 10 {
					startRange = 0
				} else {
					startRange = lenAux - 10
				}

				for a := lenAux; a > startRange; a-- {
					err := GetKeywords(keywords[a], c)
					if err != nil {
						break
					}
				}

			}

		}

		wg.Done()

	}(input, &keyChan)

	go func() {
		for v := range keyChan {
			//fmt.Printf("Keyword: %v \n", v)
			keywords = append(keywords, v)
		}
	}()

	wg.Wait()

	return keywords, nil
}

func GetKeywords(input string, c *chan string) error {

	input = url.QueryEscape(input)

	res, err := http.Get(fmt.Sprintf("https://clients1.google.com/complete/search?hl=en&output=toolbar&q=%v", input))

	if err != nil {
		return err
	}

	val, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	var keywords TopLevel

	err = xml.Unmarshal(val, &keywords)
	if err != nil {
		return err
	}

	for _, s := range keywords.CompleteSuggestions {
		*c <- s.Suggestion.Data
	}

	return nil
}

func GenerateCombinations(input []string, start int, result []string, combinations *[]string) {
	for i := start; i < len(input); i++ {
		result = append(result, input[i])
		*combinations = append(*combinations, strings.Join(result, " "))
		GenerateCombinations(input, i+1, result, combinations)
		result = result[:len(result)-1]
	}
}
