"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbService = require('../../services/mongodb.service');
const userService = require('../user/user.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId;
async function query(filterBy) {
    const collection = await dbService.getCollection('entity_db');
    try {
        let filterCriteria;
        if (filterBy) {
            filterCriteria = _buildCriteria(filterBy);
        }
        else
            filterCriteria = {};
        const entities = await collection.find(filterCriteria).toArray();
        return entities;
    }
    catch (err) {
        logger.error('cannot find entities', err);
        throw err;
    }
}
async function getById(entityId) {
    try {
        const collection = await dbService.getCollection('entity_db');
        const entity = collection.findOne({
            _id: ObjectId(entityId),
        });
        return entity;
    }
    catch (err) {
        logger.error(`while finding entity ${entityId}`, err);
        throw err;
    }
}
async function remove(entityId) {
    try {
        const collection = await dbService.getCollection('entity_db');
        await collection.deleteOne({ _id: ObjectId(entityId) });
        return entityId;
    }
    catch (err) {
        logger.error(`cannot remove entity ${entityId}`, err);
        throw err;
    }
}
async function add(friendRequest) {
    try {
        const collection = await dbService.getCollection('user');
        const sender = await userService.getById(friendRequest.fromUser._id);
        if (sender.friendRequests.findIndex(req => req.toUser._id === friendRequest.toUser._id) > -1)
            throw Error('Request already sent!');
        await collection.updateMany({
            $or: [
                { _id: ObjectId(friendRequest.fromUser._id) },
                { _id: ObjectId(friendRequest.toUser._id) },
            ],
        }, { $push: { friendRequests: friendRequest } });
    }
    catch (err) {
        logger.error('cannot send friend request', err);
        throw err;
    }
}
// Accept friend request
async function update(friendRequest) {
    try {
        // peek only updatable properties
        const collection = await dbService.getCollection('user');
        const sender = await userService.getById(friendRequest.fromUser._id);
        const reciever = await userService.getById(friendRequest.toUser._id);
        sender.friendRequests.forEach(async (friendReq) => {
            if (friendReq.fromUser._id === friendRequest.fromUser._id &&
                friendReq.toUser._id === friendRequest.toUser._id)
                friendReq.status = 'confirmed';
            console.log('Curr request reciever id', friendReq.fromUser._id, 'Recieved request reciever id', friendRequest.fromUser._id);
        });
        reciever.friendRequests.forEach(friendReq => {
            if (friendReq.fromUser._id === friendRequest.fromUser._id &&
                friendReq.toUser._id === friendRequest.toUser._id)
                friendReq.status = 'confirmed';
        });
        await collection.updateOne({ _id: ObjectId(friendRequest.fromUser._id) }, {
            $set: { friendRequests: [...sender.friendRequests] },
            $push: { friends: { ...friendRequest.toUser } },
        });
        await collection.updateOne({ _id: ObjectId(friendRequest.toUser._id) }, {
            $set: { friendRequests: [...reciever.friendRequests] },
            $push: { friends: { ...friendRequest.fromUser } },
        });
    }
    catch (err) {
        logger.error('Cannot update friend request', err);
        throw err;
    }
}
function _buildCriteria(filterBy) {
    //   const { name, createdAt, tags, createdBy } = filterBy
    const filterCriteria = {};
    // Some examples for possible filters
    // if (name) filterCriteria.name = { $regex: name, $options: 'i' }
    // if (createdBy) filterCriteria['createdBy._id'] = createdBy._id
    // if (createdAt) filterCriteria.createdAt = JSON.parse(createdAt)
    // if (tags?.length) filterCriteria.tags = { $in: [...tags] }
    return filterCriteria;
}
module.exports = {
    remove,
    query,
    getById,
    add,
    update,
};
//# sourceMappingURL=friend.service.js.map