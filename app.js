const args = require('minimist')(process.argv.slice(2))
const axios = require('axios').default
const JSSoup = require('jssoup').default

const site = args['site'] || args._[0]
const query = args['query'] || args._[1]
const context = args['context'] || args._[2] || 10

const searchSite = async (url, query, history = []) => {
    history.push(url)

    const matches = []
    const links = new Set()
    const domain = (new URL(url)).hostname

    // console.log(`Searching ${url} for ${query}`)

    let response

    // Get data
    try {
        response = await axios.get(url)
    } catch (err) {
        // console.error(err)
        // This needed to be handled more gracefully
        return { matches, links, domain }
    }

    let data = response.data

    if (typeof data !== "string" || response.status !== 200) return { matches, links, domain }


    // Process page
    const soup = new JSSoup(data)
    const text = soup.text

    // Find links
    const linkRegex = new RegExp('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', 'ig')
    const test = soup.findAll('a').map(x => x.attrs.href)
    test.filter(x => linkRegex.test(x) && x.includes(domain)).forEach(x => links.add(x))
    test.filter(x => !linkRegex.test(x)).map(x => url + '/' + x).forEach(x => links.add(x))


    // Find query term
    // `/\b${query}\b/` SHOULD be working according to every regex tester I can find, but it isn't working here.
    // So I'm settling for some bad results instead of no results
    const searchRegex = new RegExp(`${query}`, 'gi')
    for (const match of text.matchAll(searchRegex)) {
        const out = match.input
            .slice(Math.max(match.index - context, 0), Math.min(match.index + match[0].length + context, match.input.length))
            .replace(/\s{2,}/, ' ')
        matches.push(out)
    }

    return { matches, links: [...links], domain }
}

const main = async (site, query) => {
    console.log(`Searching ${site} for '${query}'`)

    const matches = []
    const links = new Set()
    let pages = 1

    // This could be turned into a recursive function pretty easily, or a do/while, I ran out of time
    const data = await searchSite(site, query)
    matches.push(...data.matches.map(x => `${site} => '${x}'`))
    data.links.forEach(x => links.add(x))

    const promises = data.links.map(async link => {
        const moreData = await searchSite(link, query, [site])
        matches.push(...moreData.matches.map(x => `${link} => '${x}'`))
        moreData.links.forEach(x => links.add(x))
        pages++
    })

    await Promise.all(promises)
    console.log(matches)
    console.log(`Crawled ${links.size} links across ${pages} pages. Found ${matches.length} matches`)
}

main(site, query)
    .then(() => console.log('Program complete'))
    .catch(e => console.error(e))
