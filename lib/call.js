class CallManager {
    constructor(userStore) {
        this.userStore = userStore; // This will store the UserManager instance
        this.calls = {}; // Maps call ID to call details
        this.callSessions = {}; // Maps callId to call session details
        this.userToCallMap = {}; // Maps userId to callId
    }

    createCall(callerId, receiverId) {
        const receiverSocket = this.userStore.get(receiverId);
        if (receiverSocket) {
            const callId = `call_${new Date().getTime()}`;
            this.calls[callId] = {
                caller: callerId,
                receiver: receiverId,
                participants: [callerId] // Initialize participants with the caller
            };
            this.callSessions[callId] = { caller: callerId, receiver: receiverId };
        this.userToCallMap[callerId] = callId;
        this.userToCallMap[receiverId] = callId;
            // this.calls[callId] = { caller: callerId, receiver: receiverId };
            console.log("this calls ==>", this.calls)
            return { success: true, callId: callId, receiverSocket: receiverSocket };
        } else {
            return { success: false, message: 'Receiver not found' };
        }
    }
    joinCall(userId) {
        console.log("Trying to join a call, User ID:", userId);
        for (let callId in this.calls) {
            let call = this.calls[callId];
            console.log("Checking call:", callId, call);
            if (!call.participants.includes(userId) && call.participants.length < 2) {
                call.participants.push(userId);
                console.log("User joined call:", callId, call.participants);
                call.isActive = false;  // Call is full after two participants
                return { success: true, callerId: call.caller, receiver: call.receiver, callId: callId };
            }
        }
        return { success: false, message: 'No suitable call found or already in call' };
    }
    
    getCallIdForUser(userId) {
        return this.userToCallMap[userId];
    }

    endCall(callId) {
        if (this.callSessions[callId]) {
            const session = this.callSessions[callId];
            delete this.userToCallMap[session.caller];
            delete this.userToCallMap[session.receiver];
            delete this.callSessions[callId];
        }
    }
    
//     createCall(callerId) {
//     const callId = `call_${new Date().getTime()}`;
//     // Initialize call with no receiver yet
//     this.calls[callId] = { caller: callerId, participants: [callerId] };
//     return { success: true, callId: callId };
// }

    // joinCall(receiverId) {
    //     // Find an existing call that is waiting for a receiver
    //     const callEntry = Object.entries(this.calls).find(([_, call]) => call.participants.length === 1 && call.receiver === undefined);
    //     if (callEntry) {
    //         const [callId, call] = callEntry;
    //         call.receiver = receiverId;
    //         call.participants.push(receiverId);
    //         return { success: true, callId: callId, callerId: call.caller };
    //     } else {
    //         return { success: false, message: 'No call available to join' };
    //     }
    // }
    
    broadcastOffer(callId, sdp) {
        const call = this.calls[callId];
        if (call) {
            const receiverSocket = this.userManager.get(call.receiver);
            if (receiverSocket) {
                receiverSocket.emit('webrtc_offer', { sdp: sdp, from: call.caller });
                return { success: true };
            } else {
                return { success: false, message: 'Receiver not found or not connected' };
            }
        } else {
            return { success: false, message: 'Call not found' };
        }
    }

    broadcastAnswer(receiverId, sdp) {
        const call = this.findCallByUser(receiverId);
        if (call) {
            const caller = this.userStore.get(call.caller);
            if (caller) {
                caller.socket.emit('webrtc_answer', { sdp: sdp, from: receiverId });
                return { success: true };
            }
        }
        return { success: false, message: 'Call or caller not found' };
    }

   sendIceCandidate(userId, candidate) {
        const call = this.findCallByUser(userId);
        if (call) {
            const otherPartyId = (call.caller === userId) ? call.receiver : call.caller;
            const otherPartySocket = this.userStore.get(otherPartyId);
            if (otherPartySocket) {
                otherPartySocket.emit('webrtc_ice_candidate', { candidate: candidate, from: userId });
                return { success: true };
            } else {
                return { success: false, message: 'Other party not found or not connected' };
            }
        }
        return { success: false, message: 'Call or other party not found' };
    }


    findCallByUser(userId) {
        for (const callId in this.calls) {
            if (this.calls[callId].caller === userId || this.calls[callId].receiver === userId) {
                return this.calls[callId];
            }
        }
        return null;
    }

    handleDisconnect(userId) {
        Object.keys(this.calls).forEach(callId => {
          const call = this.calls[callId];
          if (call && call.participants && call.participants.includes(userId)) {  // Check if 'participants' is valid
            const index = call.participants.indexOf(userId);
            call.participants.splice(index, 1);
            if (call.participants.length === 0) {
              delete this.calls[callId];  // Optionally clean up empty calls
            }
          }
        });
      }
      
      
}

module.exports = CallManager;
