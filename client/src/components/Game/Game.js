import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { Progress } from 'react-sweet-progress'
import 'react-sweet-progress/lib/style.css'

import './Game.css'

import { IMGS } from './../constants/images'

const SCREEN_STATE = {
  play: 0,
  vote: 1,
  result: 2,
}

const Game = ({ socket, user, users, gameState, preview, onFullscreen }) => {
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
      <div className="bg-winner">
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

  const renderTitle = () => {
    return (
      <div className="article-title">
        <div className="pin-icon"></div>
        <h2 className="article-header">{gameState.article.title}</h2>
        <div className="article-calendar">
          <p>{gameState.article.date}</p>
          <img src={IMGS['calendar']} alt="calendar-img" />
        </div>
      </div>
    )
  }

  const renderVoteTitle = () => {
    return (
      <div className="article-title">
        <div className="pin-icon"></div>
        <h2 className="article-header">VOTEZ !</h2>
        <div className="article-validated">
          <p> {validVote ? 'Validé !' : 'En cours...'} </p>
        </div>
      </div>
    )
  }

  const renderWinnerTitle = () => {
    return (
      <div className="article-title">
        <div className="pin-icon"></div>
        <h2 className="article-header">RÉSULTAT !</h2>
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
        className="users-container"
        style={{ transform: users.length > 6 ? 'scale(0.8)' : 'scale(1)' }}
      >
        {users.map((u, index) => (
          <div
            key={index}
            className={`user-container ${
              !validVote && u.id !== socket.id ? 'underlined-user' : ''
            }`}
            onClick={() => onVote(u.id)}
          >
            <div className="user-details">
              <div
                className="pin-icon"
                style={{
                  backgroundColor: u.id === socket.id ? '#6ff047' : '#dd2727',
                  border:
                    u.id === socket.id
                      ? '2px solid #3faf1e'
                      : '2px solid #aa0808',
                }}
              ></div>
              <img className="user-avatar" alt="avatar-img" src={u.img} />
              <p className="user-name">{u.name}</p>
              <p className="user-role">{u.role.role}</p>
            </div>

            <div className="keywords-users-vote">
              {usersWords.get(u.id).map((userWord, index) => (
                <div key={index} onClick={() => onRemoveWord(u.id, userWord)}>
                  <p> {userWord} </p>
                </div>
              ))}
            </div>

            <div className="vote-users">
              {u.vote.map((voter, index) => (
                <img
                  key={index}
                  src={voter.img}
                  alt="avatar-susp"
                  style={{
                    border: voter.confirmed
                      ? '2px solid #daee79'
                      : '2px solid #f8e9d5',
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
        className="users-container"
        style={{ transform: users.length > 6 ? 'scale(0.8)' : 'scale(1)' }}
      >
        {users.map((usr, index) => (
          <div key={index} className="user-container">
            <div className="post-role">
              <img
                src={usr.spy ? IMGS['spy'] : IMGS['profile']}
                alt="role-img"
              />
            </div>
            <div className="user-details">
              <div
                className="pin-icon"
                style={{
                  backgroundColor: usr.id === socket.id ? '#6ff047' : '#dd2727',
                  border:
                    usr.id === socket.id
                      ? '2px solid #3faf1e'
                      : '2px solid #aa0808',
                }}
              ></div>
              <img className="user-avatar" alt="avatar-img" src={usr.img} />
              <p className="user-name">{usr.name}</p>
              <p className="user-role">{usr.role.role}</p>
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
        className="users-container"
        style={{ transform: users.length > 6 ? 'scale(0.8)' : 'scale(1)' }}
      >
        {users.map((usr, index) => (
          <div
            key={index}
            className={`user-container ${keyword ? 'underlined-user' : ''}`}
            style={{
              backgroundColor:
                usr.id === gameState.currentPlayer ? '#f8e8d4' : '#d8cab8',
            }}
            onClick={() => onPlaceWord(usr.id)}
          >
            <div className="user-details">
              <div
                className="pin-icon"
                style={{
                  backgroundColor: usr.id === socket.id ? '#6ff047' : '#dd2727',
                  border:
                    usr.id === socket.id
                      ? '2px solid #3faf1e'
                      : '2px solid #aa0808',
                  animation:
                    usr.id === gameState.currentPlayer
                      ? 'popup .5s linear'
                      : null,
                }}
              ></div>
              <img className="user-avatar" alt="avatar-img" src={usr.img} />

              <p className="user-name">{usr.name}</p>
              <p className="user-role">{usr.role.role}</p>
            </div>
            {usr.id === gameState.currentPlayer && (
              <Progress
                percent={(seconds * 100) / gameState.duration}
                className="timer-bar"
                theme={{
                  success: { symbol: ' ', color: '#d8cab8' },
                  default: { symbol: ' ', color: '#d8cab8' },
                  active: { symbol: ' ', color: '#d8cab8' },
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

  const renderPlace = () => {
    return (
      <div className="article-place">
        <img src={IMGS['map']} alt="map-img" />
        <p>{gameState.article.location}</p>
        <div className="pin-icon" style={{ left: '342px', top: '371px' }}></div>
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
              <div className="keywords-element" key={index}>
                <p
                  style={{
                    backgroundColor: word === keyword ? '#f8e8d4' : '#d8cab8',
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
              <p> {text} </p>
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
        VALIDER
      </p>
    )
  }

  const onNextRound = () => {
    socket.emit('game:continue')
  }

  useEffect(() => {
    socket.on('game:end-game', ({ users }) => {
      setScreen(SCREEN_STATE['result'])
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
        CONTINUER
      </p>
    )
  }

  const onStartRound = () => {
    socket.emit('game:start-round')
  }

  const renderPreview = () => {
    return (
      <div className="bg-preview">
        <div className="preview-title">
          <div className="pin-icon"> </div>
          <p>{gameState.article.title}</p>
        </div>

        <div className="preview-description">
          <p> {gameState.article.description} </p>
        </div>
        <button className="preview-btn" onClick={() => onStartRound()}>
          OK !
        </button>
      </div>
    )
  }

  const renderTurn = () => {
    return (
      <div className="game-turn">
        <p>
          tour {gameState.round}/{gameState.nbRound}
        </p>
      </div>
    )
  }

  const onSkipTurn = () => {
    socket.emit('game:skip-turn')
  }

  const renderSkipTurn = () => {
    return (
      <div className="game-skip-turn">
        <p onClick={() => onSkipTurn()}> PASSER SON TOUR </p>
      </div>
    )
  }

  return (
    <div id="game-container-id" className="div-game-container">
      <img
        className="game-full-screen"
        src={IMGS['fullScreen']}
        onClick={onFullscreen}
        alt="full-screen"
      />
      {gameState.currentPlayer === user.id &&
        screen === SCREEN_STATE['play'] &&
        renderSkipTurn()}
      {renderTurn()}
      {screen === SCREEN_STATE['play'] ? (
        <>
          {preview && renderPreview()}
          {renderPlace()}
          {renderSummary()}
          {renderAdvice()}
          {renderTitle()}
          {renderUsers()}
          {renderKeywords()}
        </>
      ) : screen === SCREEN_STATE['vote'] ? (
        <>
          {renderVoteTitle()}
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
