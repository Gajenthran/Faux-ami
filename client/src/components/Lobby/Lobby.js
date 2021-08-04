import React, { useEffect, useState } from 'react'
import Slider from 'rc-slider'
import { Redirect } from 'react-router-dom'

import socket from './../../config/socket'

import 'rc-slider/assets/index.css'

import './Lobby.css'
import { IMGS } from '../constants/images'

const OPTS = {
  parameters: 1,
  articles: 2,
}

const Lobby = ({ user, users }) => {
  const [nbPlayer, setNbPlayer] = useState(users.length || 4)
  const [nbKeywords, setNbKeywords] = useState(3)
  const [countdown, setCountdown] = useState(45)
  const [nbTurn, setNbTurn] = useState(2)
  const [nbRound, setNbRound] = useState(2)
  const [nbCommonWords, setNbCommonWords] = useState(0)
  const [invitedMessage, setInvitedMessage] = useState(false)
  const [selectedOpt, setSelectedOpt] = useState(OPTS['parameters'])
  const [articles, setArticles] = useState([])
  const [canStart, setCanStart] = useState(null)

  useEffect(() => {
    socket.on('lobby:create-response', ({ user, articles }) => {
      if (user === undefined || !(user.roomId || user.name))
        return <Redirect to="/" />
      setArticles(articles)
      console.log(articles)
    })
  })

  useEffect(() => {
    socket.on('lobby:join-response-user', ({ articles }) => {
      if (articles.length === 0) setArticles(articles)
    })
  }, [])

  useEffect(() => {
    socket.on('lobby:join-response-all', ({ articles }) => {
      if (articles.length === 0) setArticles(articles)
    })
  }, [])

  useEffect(() => {
    socket.on('game:start-game-response', ({ canStart }) => {
      setCanStart(canStart)
      setTimeout(() => {
        setCanStart(true)
      }, 2000)
    })
  })

  const startGame = () => {
    const articles_ = articles.filter((article) => article.checked)

    socket.emit('game:start', {
      nbPlayer,
      nbKeywords,
      nbCommonWords,
      countdown,
      nbTurn,
      nbRound,
      articles: articles_,
    })
  }

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(window.location.href)
    e.target.focus()
    setInvitedMessage(true)
    setTimeout(() => {
      setInvitedMessage(false)
    }, 2000)
  }

  const renderUsers = () => {
    return (
      <div className="lobby-users-list">
        <h3> JOUEURS - {users.length} </h3>
        <div className="lobby-users--list-row">
          {users.map((usr, index) => (
            <div className="lobby-users--infos-list" key={usr.id}>
              <div className="lobby-users--name">
                <div className="lobby-users--avatar">
                  {index === users.length - 1 && (
                    <img
                      src={IMGS['crown']}
                      className="lobby-user-crown"
                      alt="avatar"
                    />
                  )}
                  <img
                    src={usr.img}
                    className="lobby-user-avatar"
                    alt="avatar"
                  />
                </div>
                <p> {usr.name} </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderParameters = () => {
    return (
      <div className="lobby-users-options-list">
        <div className="lobby-users-options-element">
          <h6> JOUEURS max. dans une partie </h6>
          <Slider
            min={4}
            max={6}
            value={nbPlayer}
            onChange={(v) => setNbPlayer(v)}
            marks={{ 4: '4', 5: '5', 6: '6' }}
          />
        </div>
        <div className="lobby-users-options-element">
          <h6> nombre de MOTS CLEFS </h6>
          <Slider
            min={2}
            max={6}
            value={nbKeywords}
            onChange={(v) => setNbKeywords(v)}
            marks={{ 2: '2', 4: '4', 5: '5', 6: '6' }}
          />
        </div>
        <div className="lobby-users-options-element">
          <h6> mots en COMMUN </h6>
          <Slider
            min={0}
            max={5}
            value={nbCommonWords}
            onChange={(v) => {
              if (v < nbKeywords) setNbCommonWords(v)
            }}
            marks={{ 0: '0', 1: '1', 2: '2', 5: '5' }}
          />
        </div>
        <div className="lobby-users-options-element">
          <h6> TEMPS DE PAROLE (en seconde) </h6>
          <Slider
            min={3}
            max={300}
            value={countdown}
            onChange={(v) => setCountdown(v)}
            marks={{ 30: '30', 60: '60', 120: '120', 200: '200', 300: '300' }}
          />
        </div>
        <div className="lobby-users-options-element">
          <h6> nombre d'ENQUÊTES </h6>
          <Slider
            min={2}
            max={5}
            value={nbRound}
            onChange={(v) => setNbRound(v)}
            marks={{ 2: '2', 3: '3', 4: '4', 5: '5' }}
          />
        </div>
        <div className="lobby-users-options-element">
          <h6> TOURS DE TABLE pour une enquête </h6>
          <Slider
            min={1}
            max={3}
            value={nbTurn}
            onChange={(v) => setNbTurn(v)}
            marks={{ 1: '1', 2: '2', 3: '3' }}
          />
        </div>
      </div>
    )
  }

  const onCheckArticle = (index) => {
    const articles_ = [...articles]
    articles_[index].checked = !articles[index].checked
    setArticles(articles_)
  }

  const renderArticles = () => {
    return (
      <div className="lobby-users-options-articles">
        {articles.map((article, index) => (
          <div key={index} className="lobby-users-options-article">
            <label className="label-article" for={`checkbox-${index}`}>
              {article.title}
              <input
                type="checkbox"
                className="checkbox-article"
                id={`checkbox-${index}`}
                checked={article.checked}
                onClick={() => onCheckArticle(index)}
              />
              <span class="checkmark-article"></span>
            </label>
          </div>
        ))}
      </div>
    )
  }

  const renderOptions = () => {
    return (
      <div className="lobby-users-options">
        <div className="lobby-users-options--title">
          <h3
            style={{ opacity: selectedOpt === OPTS['parameters'] ? 1 : 0.5 }}
            onClick={() => setSelectedOpt(OPTS['parameters'])}
          >
            OPTIONS
          </h3>
          <h3
            style={{ opacity: selectedOpt === OPTS['articles'] ? 1 : 0.5 }}
            onClick={() => setSelectedOpt(OPTS['articles'])}
          >
            ARTICLES
          </h3>
        </div>
        <div className="lobby-options-container">
          {selectedOpt === OPTS['parameters'] && renderParameters()}
          {selectedOpt === OPTS['articles'] && renderArticles()}
        </div>
      </div>
    )
  }

  const onReturnHome = () => {
    window.location = '/'
  }

  return (
    <>
      <div className="lobby-screen">
        {user ? (
          <div className="div-lobby">
            <div className="lobby--title" onClick={() => onReturnHome()}>
              <h3> Faux-Ami </h3>
              <img src={IMGS['pin']} alt="pin" />
            </div>
            <div className="lobby--container">
              {renderOptions()}
              {renderUsers()}
            </div>

            <div className="lobby-start-game">
              <button
                className="lobby--start-btn"
                onClick={(e) => startGame(e)}
              >
                LANCER LA PARTIE
                {canStart === false && <span> NB JOUEURS INSUFFISANTS </span>}
              </button>
              <button
                className="lobby--invite-btn"
                onClick={(e) => copyToClipboard(e)}
              >
                INVITER {invitedMessage && <span> copié </span>}
              </button>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </>
  )
}

export default Lobby
