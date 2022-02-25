// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract OpenSpeak 
{

    struct Post {
        uint256 createdON;
        string CID;
        address[] likedBy;
        string parentCID;
        string[] replyingCIDs;
    }

    struct User {
        address _address;
        string img;
        string ens_name;
        string about;
    }

    struct Profile {
        User info;
        User[] followers;
        User[] following;
        Post[] posts;
    }

    mapping(address=>User) public directory;
    mapping(address=> Profile) public profile;
    mapping(string=> Post) public globalFeed;

    string registrationErrorText = "You must register before you can intereact with this API. Call the register function first.";
    event newPost(Post _post, User _from);

    event newReply(address _from, address _to, Post parent, Post child);

    event newFollow(User _follower, User _leader);

    function register() public {
        User memory _user;
        _user._address = msg.sender;
        directory[msg.sender] = _user;
    }

    function isRegistered(address _user) public view returns (bool){
        return directory[_user]._address != address(0x0); 
    }

    function setProfilePhoto(string memory _cid) public {
        require(isRegistered(msg.sender),registrationErrorText);
        profile[msg.sender].info.img = _cid;
    }

    function setEnsName(string memory _ens) public {
        require(isRegistered(msg.sender),registrationErrorText);
        profile[msg.sender].info.ens_name = _ens;
    }

    function setAbout(string memory _about) public {
        require(isRegistered(msg.sender),registrationErrorText);
        profile[msg.sender].info.about = _about;
    }

    function createPost(string memory _CID) public {
        require(isRegistered(msg.sender),registrationErrorText);
        Post memory _post;
        _post.createdON = block.timestamp;
        _post.CID = _CID;
        profile[msg.sender].posts.push(_post);
        globalFeed[_CID] = _post;
    }

    function replyToPost(string memory _opCID, string memory _replyingCID) public {
        require(isRegistered(msg.sender),registrationErrorText);
        Post memory _reply;
        Post storage _op = globalFeed[_opCID];
        _reply.createdON = block.timestamp;
        _reply.CID = _replyingCID;
        _reply.parentCID = _opCID;
        globalFeed[_replyingCID] = _reply;
        profile[msg.sender].posts.push(_reply);
        _op.replyingCIDs.push(_replyingCID);
    }

    function countOfFollowers() public view returns (uint256) {
        require(isRegistered(msg.sender),registrationErrorText);
        return profile[msg.sender].following.length;
    }

    function countOfFolling() public view returns (uint256) {
        require(isRegistered(msg.sender),registrationErrorText);
        return profile[msg.sender].following.length;
    }

    function countOfPosts(address _address) public view returns (uint256) {
        require(isRegistered(msg.sender),registrationErrorText);
        return profile[_address].posts.length;
    }

    function countOfReplies(string memory _cid) public view returns (uint256) {
        require(isRegistered(msg.sender),registrationErrorText);
        return globalFeed[_cid].replyingCIDs.length;
    }

    function getUserPost(address _address, uint256 postId) public view returns (Post memory){
        require(isRegistered(msg.sender),registrationErrorText);
        string storage _cid = profile[_address].posts[postId].CID;
        return globalFeed[_cid];
    }

    function isFollowing(address _userAddress) public view returns (int256) {
        require(isRegistered(msg.sender),registrationErrorText);
        User[] storage _array = profile[msg.sender].following;
        for (uint i = 0; i < _array.length; i++){
            if(_array[i]._address == _userAddress)
                return int256(i);
            }
        return -1;
    }

    function isFollower(address _userAddress) public view returns (int256) {
        require(isRegistered(msg.sender),registrationErrorText);
        User[] storage _array = profile[msg.sender].followers;
        for (uint i = 0; i < _array.length; i++){
            if(_array[i]._address == _userAddress)
                return int256(i);
            }
        return -1;
    }

    function follow(address _userAddress) public {
        require(isRegistered(msg.sender),registrationErrorText);
        require(_userAddress != msg.sender,"You can't follow yourself!");
        int256 followingId = isFollowing(_userAddress);
        if (followingId==-1){
            profile[msg.sender].following.push(directory[_userAddress]);
        }
    }

    function unFollow(address _userAddress) public {
        require(isRegistered(msg.sender),registrationErrorText);
        require(_userAddress != msg.sender,"You can't unfollow yourself!");
        int256 followingId = isFollowing(_userAddress);
        if (followingId>-1)
            delete profile[msg.sender].following[uint(followingId)];
    }
}