Local set up instructions

npm install
npm run dev
npm run build

-------------

Part 1

I chose the Theme Picker option. When javascript is disabled the theme picker is hidden and it defaults to the light theme. 

While I couln't personally ever see a flash of an incorrect theme on load. I adressed it by adding a script to the beginning of files before the stylesheets are loaded. This script checks the user's preferred color scheme and applies the correct theme before the stylesheets are loaded, preventing any flash of incorrect theme on load.

--------------

Part 2

Using innerHTML when with things that don't come from you like a remote or user provided input is a security risk because malicious code could be injected into your page. To avoid this risk filling the template using textContent and setAttribute is safer.

Tag name: usgs-quake-feed,
supported attributes: feed and limit, 
defaults: all_day and 3,
accepted values: (all_hour, all_day, all_week, all_month) and 10, 
endpoint: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{feed}.geojson, 
usage example: 
<usgs-quake-feed feed="all_day" limit="3">
    <p>Recent earthquake summaries will appear here when JavaScript is available.</p>
</usgs-quake-feed>

--------------

Part 3

I chose Eleventy as the SSG. It removed the need for copypasted headers, footers, nav and also in my projects the div repeats. It cost me being able to read the code as easily, this is a lot more rounadabout than just reading the html. I would not use an SSG for a project that is super small where copy and pasting is not that big of a deal. 


--------------

Extra Credit

What gets built
Roughly how large the index is on your site
Why it needs no search server.

It builds a pagefind folder with pagefind.js and index files that help with searchable text. The index is rooughly around the size of a MB. It needs no search server because the index is built into the site and can be searched locally without needing a server to process search queries.