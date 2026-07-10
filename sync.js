const axios = require("axios");
const fs = require("fs");
const path = require("path");

const BLOG =
    "https://get2logics.blogspot.com";

const POST_FEED =
    BLOG +
    "/feeds/posts/default?alt=json&max-results=500";

const PAGE_FEED =
    BLOG +
    "/feeds/pages/default?alt=json&max-results=200";

const POST_DIR =
    path.join(__dirname, "data", "post");

const PAGE_DIR =
    path.join(__dirname, "data", "page");

function slug(title){

    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-|-$/g,"");

}

async function downloadFeed(url){

    const response =
        await axios.get(url);

    return response.data.feed.entry || [];

}

async function syncPosts(){

    console.log("Syncing Posts...");

    const posts =
        await downloadFeed(POST_FEED);

    let metadata = [];

    for(const post of posts){

        const title =
            post.title.$t;

        const file =
            slug(title)+".json";

        const data={

            id:post.id.$t,

            title:title,

            updated:post.updated.$t,

            published:post.published.$t,

            author:
                post.author[0].name.$t,

            labels:
                post.category ?
                post.category.map(x=>x.term)
                :[],

            content:
                post.content.$t

        };

        fs.writeFileSync(

            path.join(
                POST_DIR,
                file
            ),

            JSON.stringify(
                data,
                null,
                2
            )

        );

        metadata.push({
            id: data.id,

            title:title,

            slug:file.replace(".json",""),

            updated:data.updated,

            labels:data.labels

        });

    }

    fs.writeFileSync(

        path.join(
            __dirname,
            "data",
            "post.json"
        ),

        JSON.stringify(
            metadata,
            null,
            2
        )

    );

    console.log(
        metadata.length,
        "Posts Synced"
    );

}

async function syncPages(){

    console.log("Syncing Pages...");

    const pages =
        await downloadFeed(PAGE_FEED);

    let metadata=[];

    for(const page of pages){

        const title=
            page.title.$t;

        const file=
            slug(title)+".json";

        const data={

            id:page.id.$t,

            title:title,

            updated:page.updated.$t,

            published:page.published.$t,

            author:
                page.author[0].name.$t,

            content:
                page.content.$t

        };

        fs.writeFileSync(

            path.join(
                PAGE_DIR,
                file
            ),

            JSON.stringify(
                data,
                null,
                2
            )

        );

        metadata.push({
           id: data.id,

            title:title,

            slug:file.replace(".json",""),

            updated:data.updated

        });

    }

    fs.writeFileSync(

        path.join(
            __dirname,
            "data",
            "page.json"
        ),

        JSON.stringify(
            metadata,
            null,
            2
        )

    );

    console.log(
        metadata.length,
        "Pages Synced"
    );

}

async function sync(){

    await syncPosts();

    await syncPages();

    console.log("Done");

}

sync();