# Webhead Website Crawler

## Task
Write a command-line program that crawls a website and returns all page URLs that contain a specific search keyword.

```
$ ./my_crawler https://www.apple.com reimagined
$ Crawled 342 pages. Found 14 pages with the term ‘reimagined’:
$ https://www.apple.com/ => ‘We reimagined everything.’
$ https://www.apple.com/iphone => ‘she reimagined my face’
$ https://www.apple.com/iphone/deeplink => ‘ou reimagined me’
```
The precise form of the output doesn't matter. But note the key elements: total pages crawled, total pages with results, a listing of each URL, and some context characters around the keyword (you can display more context than the 3 chars on each side shown above). 

### Other details
Crawl two levels deep from the initial page

* Don’t worry about the program’s input initially. If you want to hardcode the input, you can save getting the proper inputs from the command line at the end. Focus on the core functionality
* Ignore pages on a different domain
* Only look at server-side generated content (plain old markup) - ignore client-side generated content (JS- generated markup)
* Only search for content within the HTML, not the HTML content itself (i.e., searching for the term ‘div’ should usually return nothing unless the term div is in the content itself)
* [Optional] Have it crawl efficiently (faster than 10 URLs per second)
* [Optional] Specify the depth of the search as a command line input

## Usage

```sh
node .\app.js --site https://www.apple.com --query apple
```

OR

```sh
 node .\app.js https://news.ycombinator.com YC
```
