const io = require('socket.io');
const UserStore = require('./users'); // Manages user sessions and IDs.
const CallManager = require('./call'); // Manages calls
const cors = require('cors')
module.exports = (server) => {
  const serverIo = io(server, {
    cors: {
      origin: '*', // Adjust the origin as needed
      methods: ['GET', 'POST'], // Adjust allowed methods as needed
    }
  }).listen(server); // Remove the path option

  // server.use(cors());

  const userStore = new UserStore();
  const callManager = new CallManager(userStore);

  serverIo.on('connection', socket => {
    // console.log('A client connected:', socket.id);

  //   socket.on('init', (ids) => {
  //     // console.log("user ids ==> ", ids);
  //     const registeredUsers = userStore.createOrUpdate(socket, ids);
  //     console.log("registered users ==>", registeredUsers)
  //     if (registeredUsers) {
  //         // All users were successfully registered
  //         registeredUsers.forEach(user => {
  //             socket.emit('init', { id: user.id.ids }); // Emitting individual user IDs
  //         });
  //     } else {
  //         // Some users failed to register
  //         socket.emit('error', { message: 'Failed to register some users.' });
  //     }
     
  // });
//   socket.on('init', (ids) => {
//     // ids = Array.isArray(ids) ?  [ids]; // Convert to array if not already
    
//     console.log("user ids ==> ", ids);
//     const registeredUsers = userStore.createOrUpdate(socket, ids);
//     console.log("registered users ==>", registeredUsers);

//     // Assuming you need to register the user with each ID
//     console.log("saving to store", ids);

//     const registeredUsersArray = Object.values(registeredUsers);
    
//     if (registeredUsersArray.length > 0) {
//         // All users were successfully registered
//         registeredUsersArray.forEach(user => {
//             socket.emit('init', { id: user.id }); // Emitting individual user IDs
//         });
//     } else {
//         // Some users failed to register
//         socket.emit('error', { message: 'Failed to register some users.' });
//     }
// });

  
  
    socket.on('init', (userData) => {
      console.log("user ids ==> ", userData)
      if (userData ) {
        const user = userStore.createOrUpdate(socket, userData.ids);
        if (user) {
          socket.emit('init', { id: userData.ids });
          // console.log(`User registered: ${userData.name} with ID ${userData.id}`);
        } else {
          socket.emit('error', { message: 'Failed to register user.' });
        }
      } else {
        socket.emit('error', { message: 'Invalid user data provided.' });
      }
    });


    // socket.on('create-call', data => {
    //   console.log("creating call ==>", data)
    //   if (data.from && data.to) {
    //     const result = callManager.createCall(data.from, data.to);
    //     console.log("result ==> ", result)
    //     if (result.success) {
    //       const { callId, receiverSocket } = result;
    //       if (receiverSocket) {
    //         // Get available receiver IDs for the caller
    //         const availableReceiverIds = callManager.getReceiverIds(data.from);
    //         // Check if the receiver ID is available for the caller
    //         if (availableReceiverIds.includes(data.to)) {
    //           // Both the caller and the receiver join the same room
    //           const callerSocket = userStore.get(data.from);
    //           if (callerSocket) {
    //             callerSocket.join(callId);
    //           }
    //           receiverSocket.join(callId);
    
    //           // Notify all clients in the room that the call was created
    //           serverIo.to(callId).emit('call-created', { from: data.from, to: data.to, callId: callId });
    //           console.log('Call created with ID:', callId);
    //           callerSocket.emit('initiate-offer', { callId: callId });
    //         } else {
    //           console.error(`Receiver ID: ${data.to} not available for user ID: ${data.from}`);
    //           socket.emit('error', { message: 'Receiver not available.' });
    //         }
    //       } else {
    //         console.error(`Receiver socket not found for user ID: ${data.to}`);
    //         socket.emit('error', { message: 'Receiver not connected.' });
    //       }
    //     } else {
    //       socket.emit('error', { message: result.message });
    //     }
    //   } else {
    //     socket.emit('error', { message: 'Insufficient data provided (need both from and to).' });
    //   }
    // });
    
    socket.on('create-call', data => {
      // console.log("creating call ==>", data)
      if (data.from && data.to) {
        const result = callManager.createCall(data.from, data.to);
        // console.log("result ==> ", result)
        if (result.success) {
            const { callId, receiverSocket } = result;
            if (receiverSocket) {
                // Both the caller and the receiver join the same room
                const callerSocket = userStore.get(data.from);
                if (callerSocket) {
                    callerSocket.join(callId);
                }
                receiverSocket.join(callId);
    
                // Notify all clients in the room that the call was created
                serverIo.to(callId).emit('call-created', { from: data.from, to: data.to, callId: callId });
                // console.log('Call created with ID:', callId);
                callerSocket.emit('initiate-offer', { callId: callId });

            } else {
                console.error(`Receiver socket not found for user ID: ${data.to}`);
                socket.emit('error', { message: 'Receiver not connected.' });
            }
        } else {
            socket.emit('error', { message: result.message });
        }
      } else {
        socket.emit('error', { message: 'Insufficient data provided (need both from and to).' });
      }
    });
    
    
   
   
    socket.on('join-call', data => {
      const result = callManager.joinCall(data.callId); // Join call based on socket ID only
      console.log(result, "== result from joining call ==")
      if (result.success) {
          socket.join(result.callId); // Use returned callId to join the room
          serverIo.to(result.callId).emit('call-joined', { callId: result.callId, from: result.callerId });
          console.log(`Call joined: ${result.callId} by user: ${result.receiver}`);
      } else {
          socket.emit('error', { message: result.message });
      }
  });
  
    // Broadcast signaling messages within the room
    socket.on('webrtc_offer', (event) => {
      let callId = callManager.getCallIdForUser(event.from);

      console.log("webrtc offer info ==>>>>",  "sdp==>>>", event)
      if (callId && event.sdp) {
          // console.log(`Broadcasting WebRTC offer from ${event.from} to room ${callId}`);
          serverIo.to(callId).emit('webrtc_offer', {
            sdp: event.sdp,
            type: "offer", // Ensure the SDP type is correctly passed
            from: event.from // It can be useful to include the sender's ID

          });
      } else {
          console.error("Failed to send offer: Missing call ID or SDP information.");
          // Optionally, send an error back to the client
          socket.emit('error', { message: 'Failed to send offer: Missing call ID or SDP information.' });
      }
  });
  
  
  socket.on('webrtc_answer', (event) => {
    console.log("Received webrtc_answer event:", event);

    console.log("Received webrtc_answer event:", JSON.stringify(event));  // This will show the full structure
    if (event.callId) {
        // console.log(`Broadcasting WebRTC answer to room ${event.sdp.sdp}`);
        console.log(`Broadcasting WebRTC answer from ${event.from} to room ${event.callId}`);

        serverIo.to(event.callId).emit('webrtc_answer', {
          sdp: event.sdp.sdp,
            type: "answer", // Ensure the SDP type is correctly passed
         
        });
    } else {
        console.error("Invalid or missing SDP data:", event.sdp);
        socket.emit('error', { message: 'Invalid webrtc_answer event: Missing or incorrect SDP data.' });
    }
});




socket.on('webrtc_ice_candidate', (event) => {
  console.log("Received ICE candidate:", event);

  if (event.to && event.candidate) {
      // Assuming `getCallIdForUser` correctly retrieves the active call ID associated with the user
      let callId = callManager.getCallIdForUser(event.to);

      // console.log("Call ID from ICE candidate handling for user", event.to, "is", callId);

      if (callId) {
          console.log(`Forwarding ICE candidate to all participants in call ID ${callId}`);

          // Emit the ICE candidate to all clients in the same call room, excluding the sender
          serverIo.to(callId).emit('webrtc_ice_candidate', {
              candidate: event.candidate,
              callId: callId,
              to: event.to,  // It's useful to include 'from' for debugging and traceability

          });
      } else {
          // console.error("Failed to forward ICE candidate: No active call found for user", event.to);
          socket.emit('error', { message: 'No active call found for this user.' });
      }
  } else {
      // console.error("Failed to forward ICE candidate: Missing necessary data.");
      socket.emit('error', { message: 'Missing necessary data to forward ICE candidate.' });
  }
});

socket.on('toggle-audio', data => {
  console.log(`Audio toggled: ${data.muted} - ${data.id}`);
  socket.broadcast.emit('audio-status-changed', data);
});

socket.on('toggle-video', data => {
  console.log(`Video toggled: ${data.videoOff}`);
  socket.broadcast.emit('video-status-changed', data);
});

socket.on('toggle-screen-sharing', (data) => {
  console.log("toggle-screen-sharing ==>>>>", data)
  socket.broadcast.emit('screen-sharing-status-changed', { screenSharing: data.screenSharing, userId: data.user });
});
socket.on('end-call', (data) => {
  console.log("call ended triggered ==>>>>", data)
  socket.broadcast.emit('call-ended', { userId: data.to });
});


    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`);
      userStore.remove(socket.id);
      callManager.handleDisconnect(socket.id);
    });
  });
};



