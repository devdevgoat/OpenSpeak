'use strict'

const IPFS = require('ipfs-core')

const App = () => {
  let ipfs

  const DOM = {
      speak: () => document.getElementById('speakSubmit'),
      words: () => document.getElementById('words'),
      feed: () =>document.getElementById('feed'),
      refresh: () => document.getElementById('refreshBtn'),
  }

  const store = async (content) => {
    if (!ipfs) {
      // creat ipfs node
      ipfs = await IPFS.create({
        repo: String(Math.random() + Date.now()),
        init: { alogorithm: 'ed25519' }
      })
    }

    // connect to ipfs node
    const id = await ipfs.id()
    // build obj
    const fileToAdd = {
      content: Buffer.from(content)
    }

    //add file
    const file = await ipfs.add(fileToAdd)

    //retrieve file and read
    // const text = await cat(file.cid)

    console.log("Added File:")
    console.log(file.cid)
    console.log(`Preview: https://ipfs.io/ipfs/${file.cid}`)
    return `${file.cid}`;
  }

  const cat = async (cid) => {
    if (!ipfs) {
        // creat ipfs node
        ipfs = await IPFS.create({
            repo: String(Math.random() + Date.now()),
            init: { alogorithm: 'ed25519' }
        })
    }
    const content = [];
    console.log(`Trying to read out file ${cid}`);
    for await (const chunk of ipfs.cat(cid)) {
      content.push(chunk);
    }

    return content;
  }

  const populateFeed = async () => {
    var postCount = await window.contract.methods.countOfPosts(defaultAccount).call();
    let feed = DOM.feed();
    for (let i = 0; i<postCount; i++){
        var document = await window.contract.methods.postsOfUser(defaultAccount, 0).call();
        console.log(`Found post ${document.CID}`);
        var content = await cat(document.CID);
        var div = await createFeedEntry(defaultAccount,content);
        feed.appendChild(div);
    }
    // need to add an emit to the contract now and listen for new posts
  }


  const createFeedEntry = async (account, content ) => {
      var box = document.createElement("div");
      box.classList.add("bg-white");
      box.classList.add("border");
      box.classList.add("mt-2");
      box.innerHTML = `<div>
            <div class="d-flex flex-row justify-content-between align-items-center p-2 border-bottom">
                <div class="d-flex flex-row align-items-center feed-text px-2">
                    <img class="rounded-circle" src="https://i.imgur.com/aoKusnD.jpg" width="45">
                    <div class="d-flex flex-column flex-wrap ml-2"><span class="font-weight-bold">
                        ${account}</span><span class="text-black-50 time">40 minutes ago</span>
                    </div>
                </div>
                <div class="feed-icon px-2"><i class="fa fa-ellipsis-v text-black-50"></i></div>
            </div>
        </div>
        <div class="p-2 px-3"><span>${content}</span></div>
        <div class="d-flex justify-content-end socials p-2 py-3"><i class="fa fa-thumbs-up"></i><i class="fa fa-comments-o"></i><i class="fa fa-share"></i></div>`;
    return box;
  }

  populateFeed()

  // Event listeners
  DOM.refresh().onclick = async (e) => {
      populateFeed();
  }
  DOM.words().onsubmit = async (e) => {
    console.log('You clicked the button?! Gasp!')
    e.preventDefault()
    // let name = DOM.fileName().value
    let content = DOM.words().value

    window.cid = await store(content)
    window.lastPost = await window.contract.methods.createPost(window.cid);
    console.log('Submitting transaction');
    window.lastPost.send(
        {
            from: window.defaultAccount,
            gas: '3000000'})
    .then(function(receipt){
        console.log(receipt);
    });
  }
}

App()