import React, { useState, useEffect, useRef } from 'react';
import Video, {createLocalVideoTrack } from 'twilio-video';
import Participant from './Participant';  

const Room = ({ roomName, token, handleLogout }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };
    const participantDisconnected = participant => {
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
    };
    Video.connect(token, {
      name: roomName
    }).then(room => {
      setRoom(room);
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.participants.forEach(participantConnected);
    });

    return () => {
      setRoom(currentRoom => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.localParticipant.tracks.forEach(function(trackPublication) {
            trackPublication.track.stop();
          });
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
      });
    };
  }, [roomName, token]);

  const handleAudio = (action) => {
    // check room, lo, foreach, publication
    room.localParticipant.audioTracks.forEach((publication) => { 
      if (action) {
        publication.track.enable();
        setIsAudioOn(true);
      } else {
        publication.track.disable();
        setIsAudioOn(false);
      }
    });
  }

  const handleVideo = (action) => {
    // if (action) {
    //   publication.track.enable(); 
    //   setIsVideoOn(true);
    // } else {
    //   publication.track.disable(); 
    //   setIsVideoOn(false);
    // }
    if (action) {
      room.localParticipant.videoTracks.forEach((publication) => {
        publication.track.start();
        publication.publish();
      });
      // createLocalVideoTrack().then(localVideoTrack => {
      //   console.log(localVideoTrack, 'localVideoTrack');
      //   return room.localParticipant.publishTrack(localVideoTrack);
      // }).then(publication => {
      //   setIsVideoOn(true);
      //   console.log('Successfully unmuted your video:', publication);
      // });
    } else {
      room.localParticipant.videoTracks.forEach((publication) => { 
        // const isAsync = publication.track.disable.constructor.name === "AsyncFunction";
        publication.track.stop();
        publication.unpublish();
        // publication.track.disable(); 
        setIsVideoOn(false);
        console.log('set is video set to false');
      });
    }
  }

  const remoteParticipants = participants.map(participant => (
    <Participant 
      key={participant.sid}
      participant={participant}
      isAudioOn={isAudioOn}
      isVideoOn={isVideoOn}
    />
  ));

  return (
    <div className="room">
      <h2>Room: {roomName}</h2>
      <div className="actions">
        {
          isAudioOn ? (
            <button
              type="button"
              onClick={() => handleAudio(false)}
            >Mute Audio</button>
          ) : (
            <button
              type="button"
              onClick={() => handleAudio(true)}
            >Unmute Audio</button>
          )
        }
        {
          isVideoOn ? (
            <button
              type="button"
              onClick={() => handleVideo(false)}
            >Mute Video</button>
          ) : (
            <button
              type="button"
              onClick={() => handleVideo(true)}
            >Unmute Video</button>
          )
        }
      </div>
      <button className="btn-logout" onClick={handleLogout}>Log out</button>
      <div className="local-participant">
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
            isAudioOn={isAudioOn}
            isVideoOn={isVideoOn}
          />
        ) : (
          ''
        )}
      </div>
      <h3>Remote Participants</h3>
      <div className="remote-participants">{remoteParticipants}</div>
    </div>
  );
};

export default Room;

// const handleAudioUnmute = () => {
//   room.localParticipant.audioTracks.forEach((publication) => { 
//     publication.track.enable();
//     setIsAudioOn(true);
//   });
// }

// const handleVideoUnmute = () => {
//   room.localParticipant.videoTracks.forEach((publication) => { 
//     // const isAsync = publication.track.enable.constructor.name === "AsyncFunction";
//     publication.track.enable(); 
//     setIsVideoOn(true);
//   });
// }