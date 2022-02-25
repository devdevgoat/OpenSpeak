'use strict'

const IPFS = require('ipfs-core')

var Web3 = require('web3');
const ipfsapp = require('./2_ipfs');
var Contract = require('web3-eth-contract');
var acts;
var abi = require('./osABI.json');
window.abi = abi

var web3 = new Web3(Web3.givenProvider)

// connect to metamask
const ethEnabled = async () => {
    if (window.ethereum !== undefined) {
        acts = await window.ethereum.request({method: 'eth_requestAccounts'});
        window.defaultAccount = acts[0];
        web3.eth.defaultAccount = acts[0];
        // window.web3 = new Web3(window.ethereum);
       
        // window.web3.eth.defaultAccount = acts[0];
      return true;
    } else{
      alert('Not a Web3 enabled browser!')
    }
    return false;
  }

  let ipfs

  const DOM = {
      speak: () => document.getElementById('speak'),
      words: () => document.getElementById('words'),
      feed: () =>document.getElementById('feed'),
      refresh: () => document.getElementById('refreshBtn'),
      register: () => document.getElementById('register'),
      error: () => document.getElementById('error'),
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
      return `${file.cid}`
  }

  const alert = async (error) => {
    let el = DOM.error()
    el.innerText = error.message
    var popup = new bootstrap.Collapse(el)
    popup.toggle()
    hasAlert= true
  }

  const hideAlert = async () => {
    let el = DOM.error()
    el.innerText = ''
    var popup = new bootstrap.Collapse(el)
    popup.toggle()
    hasAlert = false
  }

  var hasAlert = false;

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
    if(!await isRegistered()) {
      console.log("Register first");
      return;
    } else {
      console.log("User is registered, loading feed")
      try {
        if (hasAlert) hideAlert()
        var postCount = await window.contract.methods.countOfPosts(defaultAccount).call();
        let feed = DOM.feed();
        for (let i = 0; i<postCount; i++){
            var ipfsDoc = await window.contract.methods.postsOfUser(defaultAccount, i).call();
            console.log(`Found post ${ipfsDoc.CID}`);
            if (!document.body.contains(document.getElementById(ipfsDoc.CID))){
              var div = await createFeedEntry(defaultAccount,ipfsDoc.CID);
              feed.prepend(div);
            }
        }
      } catch (err) {
        console.log(err)
        alert(err)
      }
      
    }
    // need to add an emit to the contract now and listen for new posts
  }


  const createFeedEntry = async (account, cid ) => {
      var content = await cat(cid);
      var box = document.createElement("div");
      box.setAttribute("id", cid);
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

  const isRegistered = async () => {
    return await window.contract.methods.isRegistered(window.defaultAccount).call()
  }

  // Event listeners
  DOM.refresh().onclick = async (e) => {
    //prevent page refresh
    e.preventDefault()
    populateFeed()
  }
  DOM.speak().onsubmit = async (e) => {
    //prevent page refresh
    e.preventDefault()
    // let name = DOM.fileName().value
    let content = DOM.words().value

    window.cid = await store(content)
    window.lastPost = await window.contract.methods.createPost(window.cid);
    console.log('Submitting transaction...');
    window.lastPost.send(
        {
            from: window.defaultAccount,
            gas: '3000000'})
    .then(function(receipt){
        console.log(receipt);
    });
  }

  DOM.register().onclick = async (e) => {
    e.preventDefault()
    window.contract.methods.register().send({
      from: window.defaultAccount,
      gas: '3000000'})
    .then(function(receipt){
        console.log(receipt);
    }).catch((error)=>{
      alert(error)
    });
  }



if (ethEnabled) {
  // get friends
  console.log("we have eth!");
  window.ethereum.request({method: 'eth_requestAccounts'}).then(acts => {
      window.defaultAccount = acts[0];
      
      Contract.setProvider(window.ethereum);
      window.contract = new Contract(abi, '0xe97dE59010A39fE0913A897F5C205a85122D6b59');
      console.log("loading feed");
      populateFeed();
  });

}