import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { Progress } from 'react-sweet-progress'
import 'react-sweet-progress/lib/style.css'

import './Game.css'

import { IMGS } from './../global'

const SCREEN_STATE = {
  play: 0,
  vote: 1,
  result: 2,
}

const Game = ({
  socket,
  user,
  users,
  gameState,
  playSettings,
  onFullscreen,
}) => {
  const [winner, setWinner] = useState(null)
  const [screen, setScreen] = useState(SCREEN_STATE['play'])
  const [isCounterActive, setCounterActive] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [validVote, setValidVote] = useState(false)

  const _usersWords = new Map()
  for (let i = 0; i < users.length; i++) _usersWords.set(users[i].id, [])

  const [keyword, setKeyword] = useState(null)
  const [usersWords, setUsersWords] = useState(_usersWords)

  useEffect(() => {
    socket.on('game:new-game', ({ users }) => {
      const _usersWords = new Map()
      for (let i = 0; i < users.length; i++) _usersWords.set(users[i].id, [])
      console.log(_usersWords)
      setUsersWords(_usersWords)
    })
  }, [socket])

  useEffect(() => {
    socket.on('game:end-round', () => {
      setScreen(SCREEN_STATE['vote'])
      setCounterActive(false)
      setSeconds(0)
    })
  }, [socket])

  useEffect(() => {
    let interval = null
    if (isCounterActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1)
      }, 1000)
    } else if (!isCounterActive && seconds !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isCounterActive, seconds])

  useEffect(() => {
    socket.on('game:end-turn', () => {
      setSeconds(0)
    })
  }, [socket])

  useEffect(() => {
    socket.on('game:start-round-response', () => {
      setCounterActive(true)
    })
  }, [socket])

  useEffect(() => {
    socket.on('game:end-vote', () => {
      setScreen(SCREEN_STATE['result'])
    })
  }, [socket])

  const onRestart = (event) => {
    event.preventDefault()
    socket.emit('game:restart')
  }

  const renderWinner = () => {
    return (
      <div className={'bg-future-cards'}>
        <div className="winner-container">
          <img
            className="winner-crown-img"
            src={IMGS['crown']}
            alt="crown"
            style={{ animation: 'rotating 0.9s ease infinite' }}
          />

          <div className="winner-container-avatar">
            <div className="winner-container-img">
              <img src={winner.img} alt="back" />
              <p> {winner.name} </p>
            </div>
          </div>
          <button onClick={(e) => onRestart(e)}> RETOURNER AU LOBBY </button>
        </div>
      </div>
    )
  }

  const renderTitle = (
    width,
    height,
    top,
    left,
    text,
    textStyle,
    img,
    imgX,
    imgY,
    transform,
    pinX,
    pinY
  ) => {
    return (
      <div className="post-it" style={{ width, height, top, left, transform }}>
        <div className="post-container">
          <div className="pin-icon" style={{ left: pinX, top: pinY }}>
            {' '}
          </div>
          {img && <img alt="avatar-img" src={img} />}

          <p className="post-text" style={textStyle}>
            {gameState.article.title}
          </p>
        </div>
      </div>
    )
  }

  const renderVoteTitle = () => {
    return (
      <div className="post-it">
        <div className="post-container">
          <div className="pin-icon"> </div>
          <p className="post-text">{'VOTEZ !'}</p>
        </div>
      </div>
    )
  }

  const renderWinnerTitle = () => {
    return (
      <div className="post-it">
        <div className="post-container">
          <div className="pin-icon"> </div>
          <p className="post-text">RÉSULTAT !</p>
        </div>
      </div>
    )
  }

  const onPlaceWord = (userId) => {
    if (!keyword) return

    if (usersWords.get(userId).includes(keyword)) return

    setUsersWords(
      new Map(usersWords.set(userId, [...usersWords.get(userId), keyword]))
    )
    setKeyword(null)
  }

  const onRemoveWord = (userId, word) => {
    const wordIndex = [...usersWords.get(userId)].indexOf(word)
    if (wordIndex === -1) return

    const newUserWord = [...usersWords.get(userId)]
    newUserWord.splice(wordIndex, 1)
    setUsersWords(new Map(usersWords.set(userId, newUserWord)))
  }

  const onVote = (userId) => {
    if (userId !== socket.id && !validVote) socket.emit('game:vote', { userId })
  }

  const renderVoteUsers = () => {
    return (
      <div
        className="avatars-container"
        style={{
          top: '17%',
          left: '0%',
          transform: users.length > 6 ? 'scale(0.8)' : 'scale(1)',
        }}
      >
        {users.map((usr, index) => (
          <div
            key={index}
            className={`post-it ${
              !validVote && usr.id !== socket.id ? 'underline-player' : null
            }`}
            style={{
              position: 'relative',
              left: '0%',
              width: '170px',
              height: '210px',
              margin: '2px 5px',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => onVote(usr.id)}
          >
            <div className="post-container">
              <div
                className="pin-icon"
                style={{
                  backgroundColor:
                    usr.id === socket.id
                      ? 'rgb(111, 240, 71)'
                      : 'rgb(221, 39, 39)',
                  border:
                    usr.id === socket.id
                      ? '2px solid rgb(63, 175, 30)'
                      : '2px solid rgb(170, 8, 8)',
                }}
              >
                {' '}
              </div>
              <img
                alt="avatar-img"
                src={usr.img}
                style={{
                  width: '120px',
                  height: '120px',
                  top: '20px',
                  left: '27px',
                }}
              />

              <p
                className="post-text"
                style={{
                  fontSize: '30px',
                  top: '150px',
                  color: '#BD9B72',
                }}
              >
                {usr.name}
              </p>
              <p
                className="post-text"
                style={{
                  fontSize: '20px',
                  top: '180px',
                }}
              >
                {usr.role.role}
              </p>
            </div>
            <div className="keywords-users-vote" style={{ top: '220px' }}>
              {usersWords.get(usr.id).map((userWord, index) => (
                <div key={index}>
                  <p> {userWord} </p>
                </div>
              ))}
            </div>
            <div className="vote-users">
              {usr.vote.map((voter, index) => (
                <img
                  key={index}
                  src={voter.img}
                  alt="avatar-susp"
                  style={{
                    border: voter.confirmed
                      ? '2px solid rgb(218, 238, 121)'
                      : '2px solid rgb(248, 233, 213)',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderWinnerUsers = () => {
    return (
      <div
        className="avatars-container"
        style={{
          top: '25%',
          left: '0%',
          transform: users.length > 6 ? 'scale(0.8)' : 'scale(1)',
        }}
      >
        {users.map((usr, index) => (
          <div
            key={index}
            className={`post-it`}
            style={{
              position: 'relative',
              left: '0%',
              width: '170px',
              height: '210px',
              margin: '2px 5px',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => onVote(usr.id)}
          >
            <div className="post-role">
              <img
                src={usr.spy ? IMGS['spy'] : IMGS['profile']}
                alt="role-img"
              />
            </div>
            <div className="post-container">
              <div
                className="pin-icon"
                style={{
                  backgroundColor:
                    usr.id === socket.id
                      ? 'rgb(111, 240, 71)'
                      : 'rgb(221, 39, 39)',
                  border:
                    usr.id === socket.id
                      ? '2px solid rgb(63, 175, 30)'
                      : '2px solid rgb(170, 8, 8)',
                }}
              >
                {' '}
              </div>
              <img
                alt="avatar-img"
                src={usr.img}
                style={{
                  width: '120px',
                  height: '120px',
                  top: '20px',
                  left: '27px',
                }}
              />

              <p
                className="post-text"
                style={{
                  fontSize: '30px',
                  top: '150px',
                  color: '#BD9B72',
                }}
              >
                {usr.name}
              </p>
              <p
                className="post-text"
                style={{
                  fontSize: '20px',
                  top: '180px',
                }}
              >
                {usr.role.role}
              </p>
            </div>
            <div className="users-score">
              <CountUp
                start={usr.score - usr.currentScore}
                end={usr.score}
                duration={3}
                delay={0}
              >
                {({ countUpRef }) => <p ref={countUpRef} />}
              </CountUp>
              <div className="users-current-score">+{usr.currentScore}</div>
            </div>
            <div className="comments-users">
              {usr.comments.map((comment, index) => (
                <div key={index}>
                  <p> {comment} </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderUsers = () => {
    return (
      <div
        className="avatars-container"
        style={{
          top: '25%',
          left: '0%',
          transform: users.length > 6 ? 'scale(0.8)' : 'scale(1)',
        }}
      >
        {users.map((usr, index) => (
          <div
            key={index}
            className={`post-it ${keyword ? 'underline-player' : null}`}
            style={{
              position: 'relative',
              left: '0%',
              width: '170px',
              height: '210px',
              margin: '2px 5px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor:
                usr.id === gameState.currentPlayer
                  ? 'rgb(248, 232, 212)'
                  : 'rgb(216, 202, 184)',
            }}
            onClick={() => onPlaceWord(usr.id)}
          >
            <div className="post-container">
              <div
                className="pin-icon"
                style={{
                  backgroundColor:
                    usr.id === socket.id
                      ? 'rgb(111, 240, 71)'
                      : 'rgb(221, 39, 39)',
                  border:
                    usr.id === socket.id
                      ? '2px solid rgb(63, 175, 30)'
                      : '2px solid rgb(170, 8, 8)',
                  animation:
                    usr.id === gameState.currentPlayer
                      ? 'popup .5s linear'
                      : null,
                }}
              >
                {' '}
              </div>
              <img
                alt="avatar-img"
                src={usr.img}
                style={{
                  width: '120px',
                  height: '120px',
                  top: '20px',
                  left: '27px',
                }}
              />

              <p
                className="post-text"
                style={{
                  fontSize: '30px',
                  top: '150px',
                  color: '#BD9B72',
                }}
              >
                {usr.name}
              </p>
              <p
                className="post-text"
                style={{
                  fontSize: '20px',
                  top: '180px',
                }}
              >
                {usr.role.role}
              </p>
            </div>
            {usr.id === gameState.currentPlayer && (
              <Progress
                percent={(seconds * 100) / gameState.duration}
                className="timer-bar"
                theme={{
                  success: {
                    symbol: '⏰',
                    color: 'rgb(216, 202, 184)',
                  },
                  default: {
                    symbol: ' ',
                    color: 'rgb(216, 202, 184)',
                  },
                  active: {
                    symbol: ' ',
                    color: 'rgb(216, 202, 184)',
                  },
                }}
              />
            )}
            <div className="keywords-users">
              {usersWords.get(usr.id).map((userWord, index) => (
                <div key={index} onClick={() => onRemoveWord(usr.id, userWord)}>
                  <p> {userWord} </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderValidation = () => {
    return (
      <div
        className="post-it"
        style={{
          width: '240px',
          height: '40px',
          top: '2%',
          left: '64%',
          transform: 'rotateZ(-2deg)',
        }}
      >
        <div className="post-container">
          <p className="post-text" style={{ top: '5px' }}>
            {validVote ? 'Validé !' : 'En cours...'}
          </p>
        </div>
      </div>
    )
  }

  const renderDate = () => {
    return (
      <div
        className="post-it"
        style={{
          width: '240px',
          height: '40px',
          top: '14%',
          left: '64%',
          transform: 'rotateZ(-2deg)',
        }}
      >
        <div className="post-container">
          <p className="post-text" style={{ top: '5px' }}>
            {gameState.article.date}
          </p>
          <img
            src={IMGS['calendar']}
            alt="calendar-img"
            style={{
              width: '70px',
              height: '70px',
              right: '-50px',
              top: '10px',
              transform: 'rotateZ(9deg)',
            }}
          />
        </div>
      </div>
    )
  }

  const renderPlace = () => {
    return (
      <div
        style={{
          position: 'absolute',
          top: '-50px',
        }}
      >
        <img
          src={IMGS['map']}
          alt="map-img"
          style={{
            width: '400px',
            height: '400px',
            transform: 'rotateZ(5deg)',
          }}
        />
        <div
          className="post-it"
          style={{
            width: '240px',
            height: '40px',
            top: '50%',
            transform: 'rotateZ(-2deg)',
          }}
        >
          <div className="post-container">
            <p className="post-text" style={{ top: '5px' }}>
              {gameState.article.location}
            </p>
          </div>
        </div>
        <div className="pin-icon" style={{ left: '342px', top: '371px' }}>
          {' '}
        </div>
      </div>
    )
  }

  const renderKeywords = () => {
    const { keywords } = user
    return (
      <div className="keywords-container">
        {keywords &&
          keywords.map((word, index) => {
            return (
              <div key={index}>
                <p
                  style={{
                    backgroundColor:
                      word === keyword
                        ? 'rgb(248, 232, 212)'
                        : 'rgb(216, 202, 184)',
                    boxShadow:
                      word === keyword
                        ? '0 0 0 rgba(0, 0, 0, .5)'
                        : '5px 5px 0 rgba(0, 0, 0, .5)',
                  }}
                  onClick={() => setKeyword(word)}
                >
                  {word}
                </p>
              </div>
            )
          })}
      </div>
    )
  }

  const renderSummary = () => {
    const { summary } = gameState.article
    return (
      <div className="summary-div">
        {summary &&
          summary.map((text, index) => (
            <div key={index}>
              {' '}
              <p> {text} </p>{' '}
            </div>
          ))}
      </div>
    )
  }

  const renderAdvice = () => {
    const { suspicious } = user.role
    return (
      <div className="advice-div">
        {suspicious &&
          suspicious.map((suspect, index) => {
            const usr = users.find((usr) => suspect.role === usr.role.role)
            if (!usr) return null

            return (
              <div key={index}>
                <img
                  src={users.find((usr) => suspect.role === usr.role.role).img}
                  alt="advice-img"
                />
                <p> {suspect.description} </p>
              </div>
            )
          })}
      </div>
    )
  }

  const onValidVote = () => {
    if (user && user.voted) setValidVote(true)
    socket.emit('game:confirm-vote')
  }

  const renderVoteButton = () => {
    return (
      <p className="vote-button" onClick={() => onValidVote()}>
        {' '}
        VALIDER{' '}
      </p>
    )
  }

  const onNextRound = () => {
    socket.emit('game:continue')
  }

  useEffect(() => {
    socket.on('game:end-game', ({ users }) => {
      setWinner(users[0])
    })
  }, [socket])

  useEffect(() => {
    socket.on('game:new-round', () => {
      setCounterActive(false)
      setSeconds(0)
      setValidVote(false)
      const _usersWords = new Map()
      for (let i = 0; i < users.length; i++) _usersWords.set(users[i].id, [])

      setKeyword(null)
      setUsersWords(_usersWords)
      setScreen(SCREEN_STATE['play'])
    })
  }, [socket, users])

  const renderWinnerButton = () => {
    return (
      <p className="vote-button" onClick={() => onNextRound()}>
        {' '}
        CONTINUER{' '}
      </p>
    )
  }

  const onValidSettings = () => {
    socket.emit('game:start-round')
  }

  const renderSettings = () => {
    console.log('settings')
    return (
      <div className="bg-settings">
        <div className="post-it">
          <div className="post-container">
            <div className="pin-icon"> </div>
            <p className="post-text">{gameState.article.title}</p>
          </div>
        </div>

        <div className="settings-post-it">
          <div className="post-container">
            <p> {gameState.article.description} </p>
          </div>
          <button onClick={() => onValidSettings()}> OK ! </button>
        </div>
      </div>
    )
  }

  const renderTurn = () => {
    return (
      <div className="game-turn">
        <p>
          {' '}
          Tour {gameState.round}/{gameState.nbRound}{' '}
        </p>
      </div>
    )
  }

  return (
    <div id="game-board">
      <img
        className="game-full-screen"
        src={IMGS['fullScreen']}
        onClick={onFullscreen}
        alt="full-screen"
      />
      {renderTurn()}
      {screen === SCREEN_STATE['play'] ? (
        <>
          {renderTitle()}
          {renderDate()}
          {renderPlace()}
          {renderUsers()}
          {renderKeywords()}
          {renderSummary()}
          {renderAdvice()}
          {playSettings && renderSettings()}
        </>
      ) : screen === SCREEN_STATE['vote'] ? (
        <>
          {renderVoteTitle()}
          {renderValidation()}
          {renderVoteUsers()}
          {!validVote && renderVoteButton()}
        </>
      ) : (
        <>
          {renderWinnerTitle()}
          {renderWinnerUsers()}
          {renderWinnerButton()}
          {winner && renderWinner()}
        </>
      )}
    </div>
  )
}

export default Game
