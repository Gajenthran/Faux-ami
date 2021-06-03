import React, { useEffect, useState } from 'react'
import RangeSlider from 'react-bootstrap-range-slider'
// import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { Fade } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'

import socket from './../../config/socket'

import './Lobby.css'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'

/**
 * Lobby component to manage the game options and
 * start the game.
 *
 * @param {object} lobbyUsers - lobby users
 * @param {string} [lobbyUsers.name] - username
 * @param {string} [lobbyUsers.room] - user room
 * @param {array} users - others users in the room
 */
const Lobby = ({ user, users }) => {
  const [hoverRules, setHoverRules] = useState(false)
  const [hoverUsers, setHoverUsers] = useState(false)
  const [nbPlayer, setNbPlayer] = useState(6)
  const [nbCardsToDistribute, setNbCardsToDistribute] = useState(5)
  const [nbCardsToShow, setNbCardsToShow] = useState(3)
  const [countdown, setCountdown] = useState(2)
  const [nbTurn, setNbTurn] = useState(1)
  const [playerOptions, setPlayerOptions] = useState(false)
  const [distributeOptions, setDistributeOptions] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [countdownOptions, setCountdownOptions] = useState(false)
  const [turnOptions, setTurnOptions] = useState(false)

  useEffect(() => {
    socket.on('lobby:create-response', ({ user }) => {
      if (user === undefined || !(user.roomId || user.name)) 
        return <Redirect to="/" />
    })
  })

  /**
   * Start the game and emit options game to the server.
   *
   * @param {object} event - event
   */
  const startGame = () => {
    socket.emit('game:start', { 
      nbPlayer, nbCardsToDistribute, 
      countdown, nbTurn, nbCardsToShow
    })
  }

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(window.location.href)
    e.target.focus()
  }

  /**
   * Render all users in the lobby.
   */
  const renderUsers = () => {
    return (
      <div
        onMouseEnter={() => setHoverUsers(true)}
        onMouseLeave={() => setHoverUsers(false)}
        className="lobby--container lobby-users-list"
      >
        <h3> JOUEURS</h3>
        <Fade in={hoverUsers}>
          <h5> ({users.length}) </h5>
        </Fade>
        <div className="lobby-users--list-row">
          <div className="lobby-users--infos-list" key={socket.id}>
            <div className="lobby-users--name">
              <img src={user.img} alt="avatar" />
              {user.name}
            </div>
          </div>
          {users.map(
            (user) =>
              user.id !== socket.id && (
                <div className="lobby-users--infos-list" key={user.id}>
                  <div className="lobby-users--name">
                    <img src={user.img} alt="avatar" />
                    {user.name}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    )
  }

  /**
   * Render game options.
   */
  const renderOptions = () => {
    return (
      <div
        onMouseEnter={() => setHoverRules(true)}
        onMouseLeave={() => setHoverRules(false)}
        className="lobby--container lobby-users-options"
      >
        <h3> OPTIONS </h3>
        <Fade in={hoverRules}>
          <h5> DE JEU </h5>
        </Fade>
        <div className="lobby-users-options-list">
          <div
            onMouseEnter={() => setPlayerOptions(true)}
            onMouseLeave={() => setPlayerOptions(false)}
          >
            <h6> JOUEURS</h6>
            <Fade in={playerOptions}>
              <div className="lobby-users-options-desc">
                Nombre de joueurs max. dans une partie
              </div>
            </Fade>
            <RangeSlider
              min={2}
              max={6}
              value={nbPlayer}
              onChange={(e) => setNbPlayer(Number(e.target.value))}
            />
          </div>
          <div
            onMouseEnter={() => setDistributeOptions(true)}
            onMouseLeave={() => setDistributeOptions(false)}
          >
            <h6> CARTES AU DÉPART </h6>
            <Fade in={distributeOptions}>
              <div className="lobby-users-options-desc">
                Nombre de cartes à piocher au départ
              </div>
            </Fade>
            <RangeSlider
              min={1}
              max={20}
              value={nbCardsToDistribute}
              onChange={(e) => setNbCardsToDistribute(Number(e.target.value))}
            />
          </div>
          <div
            onMouseEnter={() => setCountdownOptions(true)}
            onMouseLeave={() => setCountdownOptions(false)}
          >
            <h6> COMPTE À REBOURS </h6>
            <Fade in={countdownOptions}>
              <div className="lobby-users-options-desc">
                Compte à rebours après chaque carte jouée (ex: "Nope")
              </div>
            </Fade>
            <RangeSlider
              min={1}
              max={5}
              value={countdown}
              onChange={(e) => setCountdown(Number(e.target.value))}
            />
          </div>
          <div
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
          >
            <h6> VOIR L'AVENIR </h6>
            <Fade in={showOptions}>
              <div className="lobby-users-options-desc">
                Nombre de cartes à voir avec "Voir l'avenir"
              </div>
            </Fade>
            <RangeSlider
              min={1}
              max={10}
              value={nbCardsToShow}
              onChange={(e) => setNbCardsToShow(Number(e.target.value))}
            />
          </div>
          <div
            onMouseEnter={() => setTurnOptions(true)}
            onMouseLeave={() => setTurnOptions(false)}
          >
            <h6> TOURS </h6>
            <Fade in={turnOptions}>
              <div className="lobby-users-options-desc">
                Nombre de tours à jouer avant de passer la main
              </div>
            </Fade>
            <RangeSlider
              min={1}
              max={3}
              value={nbTurn}
              onChange={(e) => setNbTurn(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="lobby-screen">
        {user ? (
          <div className="div-lobby">
            <div className="div-lobby--row">
              {renderOptions()}
              {renderUsers()}
            </div>

            <div className="lobby-start-game">
              <button onClick={(e) => startGame(e)}> LANCER LA PARTIE </button>
              <button onClick={(e) => copyToClipboard(e)}> INVITER </button>
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
