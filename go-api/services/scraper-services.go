package services

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly"
)

func AsycScraper(links []string, filter []string, pattern string, timeout uint) []string {

	var matches []string

	var sem = make(chan bool, 2)

	for _, link := range links {

		sem <- true

		fmt.Println(link)

		go func(l string, f []string, p string, t uint) {
			matches = append(matches, WebScraping(l, f, p, t)...)
			<-sem
		}(link, filter, pattern, timeout)

	}

	return matches
}

func WebScraping(link string, filter []string, pattern string, timeout uint) []string {

	closed := false

	var matches []string
	linkChan := make(chan string)

	cl := colly.NewCollector()
	wg := sync.WaitGroup{}

	ctx, cancel := context.WithDeadline(context.TODO(), time.Now().Add(time.Duration(time.Second*1)))
	defer cancel()

	wg.Add(1)

	cl.OnHTML("a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")

		pass := filterString(link, filter)

		if strings.Contains(link, "http") && pass && !closed {
			e.Request.Visit(e.Attr("href"))
		}

	})

	cl.OnResponse(func(r *colly.Response) {
		match, _ := regexp.Match(pattern, r.Body)

		if match && !closed {
			linkChan <- r.Request.URL.String()
		}

	})

	cl.OnError(func(r *colly.Response, err error) {
		fmt.Println(err)
	})

	go cl.Visit(link)

	go func() {
		for data := range linkChan {
			if data != "" && filterString(data, filter) {
				matches = append(matches, data)
			}
		}
	}()

	go func() {
		<-ctx.Done()
		closed = true
		wg.Done()
	}()

	wg.Wait()
	close(linkChan)

	return matches
}

/*
Returs true if the string passes the filter

Returns false if the string match any filter
*/
func filterString(val string, filter []string) bool {

	for _, f := range filter {
		if strings.Contains(val, f) {
			return false
		}
	}

	return true
}
