import React, { useState, useEffect, useRef } from 'react';

const Participant = ({ participant, isAudioOn, isVideoOn }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [videoEnable, setVideoEnable] = useState(true);
  const [audioEnable, setAudioEnable] = useState(true);

  const videoRef = useRef();
  const audioRef = useRef();

  const trackpubsToTracks = trackMap => Array.from(trackMap.values())
    .map(publication => publication.track)
    .filter(track => track !== null);

  useEffect(() => {
    const trackSubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => [...videoTracks, track]);
      } else {
        setAudioTracks(audioTracks => [...audioTracks, track]);
      }
    };

    const trackUnsubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => videoTracks.filter(v => v !== track));
      } else {
        setAudioTracks(audioTracks => audioTracks.filter(a => a !== track));
      }
    };
    
    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));

    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      // participant.tracks.forEach(function(trackPublication) {
      //   trackPublication.track.stop();
      // });
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    participant.tracks.forEach(publication => {

      publication.on('subscribed', () => {
        console.log('subscribed');
        if (publication.track) {
          videoRef.current.appendChild(publication.track.attach());
        }
        setVideoEnable(true);
        console.log('video enable set to true');
      });

      publication.on('unsubscribed', () => {
        if (publication.track) {
          videoRef.current.appendChild(publication.track.attach());
        }
        setVideoEnable(false);
        console.log('video enable set to false');
      });
      
      if (publication.track) {
        // console.log(publication, 'publication'); // isTrackEnabled
        publication.track.on('enabled', () => {
          if (publication.kind === 'video' && publication.isTrackEnabled) {
            videoRef.current.appendChild(publication.track.attach());
            setVideoEnable(true);
          } else if (publication.kind === 'audio' && publication.isTrackEnabled) {
            setAudioEnable(true);
          }
        });
          
        publication.track.on('disabled', () => {
          if (publication.kind === 'video' && !publication.isTrackEnabled) {
            setVideoEnable(false);
          } else if (publication.kind === 'audio' && !publication.isTrackEnabled) {
            setAudioEnable(false);
          }
        });
      }
    });

    setVideoTracks(trackpubsToTracks(participant.videoTracks));

    participant.on('trackSubscribed', track => {
      
      // console.log(track, 'track'); // enable
      track.on('enabled', () => {
        if (track.kind === 'video' && track.isEnabled) {
          videoRef.current.appendChild(track.attach());
          setVideoEnable(true);
        } else if (track.kind === 'audio' && track.isEnabled) {
          setAudioEnable(true);
        }
      });

      track.on('disabled', () => {
        if (track.kind === 'video' && !track.isEnabled) {
          setVideoEnable(false);
        } else if (track.kind === 'audio' && !track.isEnabled) {
          setAudioEnable(false);
        }
      });
    });

    // participant.videoTracks.forEach((publication) => { 
    //   console.log(publication.isTrackEnabled, 'publication');
    // });
  }, [isVideoOn, isAudioOn]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div className="participant">
      <h3>{participant.identity}</h3>
      {!audioEnable && (
        <span style={{color: '#fff'}}>audio muted</span>
      )}
      <div className={`video-block-wrapper ${videoEnable ? 'video-enabled' : ''}`}>
        {!videoEnable && (
          <span className="vc-userid">{participant.identity}</span>
        )}
        <video ref={videoRef} autoPlay={true} muted={true} />
        <audio ref={audioRef} autoPlay={true}  />
      </div>
    </div>
  );
};

export default Participant;

// const renderVideo = () => {
//   if (videoEnable) {
//     const videoTrack = videoTracks[0];
//     if (videoTrack) {
//       videoTrack.attach(videoRef.current);
//     }
//     return (<video ref={videoRef} autoPlay={true} />)
//   } else {
//     return (
//       <div className="username">{participant.identity}</div>
//     )
//   }
// }