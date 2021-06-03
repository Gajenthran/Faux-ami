import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Fade } from 'react-bootstrap'
import queryString from 'query-string'

import socket from './../../config/socket'

import './../Home/Home.css'
import { userAvatar, NB_AVATARS } from './../Home'

/**
 * Home component to create an user and a lobby.
 * There is also game rules.
 */
const Profile = ({ location }) => {
  const [name, setName] = useState('azerty')
  const [hoverGame, setHoverGame] = useState(false)
  const [hoverRules, setHoverRules] = useState(false)
  const [avatarIndex, setAvatarIndex] = useState(0)
  const { room } = queryString.parse(location.search)

  const onJoinLobby = () => {
    const user = { name, img: userAvatar.avatars[avatarIndex] }
    if (name.length !== 0) socket.emit('lobby:join', { user, room })
  }

  /**
   * Render game layout to login.
   */
  const renderGame = () => {
    return (
      <div
        onMouseEnter={() => setHoverGame(true)}
        onMouseLeave={() => setHoverGame(false)}
        className="home--container div-home--row--game"
      >
        <h3> JOUER </h3>
        <Fade in={hoverGame}>
          <h5> UNE PARTIE </h5>
        </Fade>
        <div className="div-home--form">
          <img
            className="avatar-img"
            src={userAvatar.avatars[avatarIndex]}
            alt="avatar-img"
          />
          <img
            className="avatar-left-arrow"
            src={userAvatar.leftArrow}
            alt="left-arrow-img"
            onClick={() =>
              setAvatarIndex(Math.abs((avatarIndex - 1) % NB_AVATARS))
            }
          />
          <img
            className="avatar-right-arrow"
            src={userAvatar.rightArrow}
            alt="right-arrow-img"
            onClick={() => setAvatarIndex((avatarIndex + 1) % NB_AVATARS)}
          />
          <input
            placeholder="Name"
            className="joinInput"
            type="text"
            defaultValue={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Link
            onClick={() => onJoinLobby()}
            to={name.length !== 0 ? `/game?room=${room}` : '/'}
          >
            <button className="button mt-20" type="submit">
              {' '}
              REJOINDRE LE SALON{' '}
            </button>
          </Link>
        </div>
      </div>
    )
  }

  /**
   * Render game rules.
   */
  const renderRules = () => {
    return (
      <div
        onMouseEnter={() => setHoverRules(true)}
        onMouseLeave={() => setHoverRules(false)}
        className="home--container div-home--row--rules"
      >
        <h3> RÈGLES </h3>
        <Fade in={hoverRules}>
          <h5> DU JEU </h5>
        </Fade>
        <div>
          <div className="div-home--row--rules-desc">
            1. Choisir un mot parmi la liste donnée <br />
            <br />
            2. Tentez de le faire deviner aux autres joueurs à travers les
            concepts sur les icônes. 4 familles de concepts peuvent être
            réalisées. Dans chacune d&apos;elle, nous aurons 1 concept principal
            et 4 concepts secondaires. <br />
            <br />
            3. La distribution des points se fera en fonction de la rapidité à
            laquelle les autres joueurs trouvent le mot. <br />
            <br />
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render game credits.
   */
  const renderCredits = () => {
    return (
      <div className="home--container">
        <h3> CRÉDITS </h3>
        <div className="div-home--row--rules-desc">
          Créé et développé par Gajenthran PANCHALINGAMOORTHY.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="home-screen">
        <div className="div-home">
          <div className="div-home--row">
            {renderGame()}
            {renderRules()}
          </div>
          <div className="div-home--row--credits-list">
            {renderCredits()}
            <div className="home--container"> </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
