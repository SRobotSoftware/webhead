const args = require('minimist')(process.argv.slice(2))

const axios = require('axios').default

const site = args['site'] || args._[0]
const query = args['query'] || args._[1]

const searchSite = async (site, query, history = []) => {
    history.push(site)

    console.log(`Searching ${site} for ${query}`)

    let response

    // Get data
    try {
        response = await axios.get(site)
    } catch (err) {
        // console.error(err)
        return { links: [], matches: [], history: [] }
    }

    let data = response.data

    if (typeof data !== "string") return { links: [], matches: [], history: [] }

    // Process page
    data = data.replace(/\s{2,}/g, '') // remove excess whitespace

    // Remove JS
    const stripJS = new RegExp('<script.*?\/(?:script)?>', 'gis')
    data = data.replace(stripJS, '') // strip out anything in a script tag

    // Find links
    // I'm using a regex I found here: https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
    const linkRegex = new RegExp('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', 'ig')
    const links = [...data.matchAll(linkRegex)].map(x => x[0]).filter(x => !x.endsWith('.pdf'))

    // Find matches
    // This method isn't very good, I got wrapped up on some of the earlier regex and didn't have time to fix this
    // With more time I would
    const matches = data
        .split(/<.*?\/?>/) // Break text out by HTML tags
        .filter(x => x.includes(query)) // search for query text

    links.filter(x => !history.find(y => x === y))

    return { links, matches, history }
}

const main = async (site, query) => {
    console.log(`Searching ${site} for '${query}'`)

    const matches = []
    const links = new Set()

    // This could be turned into a recursive function pretty easily, or a do/while
    const data = await searchSite(site, query)
    matches.push(...data.matches.map(x => `${site} => '${x}'`))
    data.links.forEach(x => links.add(x))

    const promises = data.links.map(async link => {
        const moreData = await searchSite(link, query, [site])
        matches.push(...moreData.matches.map(x => `${link} => '${x}'`))
        moreData.links.forEach(x => links.add(x))
    })

    await Promise.all(promises)
    console.log(matches)
    console.log(`Crawled ${links.size} pages. Found ${matches.length} matches`)
}

main(site, query)
    .then(() => console.log('Program complete'))
    .catch(e => console.error(e))
