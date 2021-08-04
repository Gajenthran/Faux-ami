import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import socket from './../../config/socket'

import './Home.css'

import { IMGS } from './../constants/images'
import { userAvatar, NB_AVATARS } from './'

const KEY_LENGTH = 8
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const createRandomKey = () => {
  const nbChars = CHARS.length
  let r = 0
  let key = ''
  for (let i = 0; i < KEY_LENGTH; i++) {
    r = Math.floor(Math.random() * nbChars)
    key += CHARS[r]
  }

  return key
}

const Home = () => {
  const [name, setName] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const room = createRandomKey()

  const onCreateLobby = () => {
    const user = { name, img: userAvatar.avatars[avatarIndex] }
    if (name.length !== 0) socket.emit('lobby:create', { user, room })
  }

  const renderAvatar = () => {
    return (
      <div className="div-home--avatar">
        <img
          className="avatar-img"
          src={userAvatar.avatars[avatarIndex]}
          alt="avatar-img"
        />
        <img
          className="avatar-left-arrow"
          src={IMGS['leftArrow']}
          alt="left-arrow-img"
          onClick={() =>
            setAvatarIndex(
              avatarIndex - 1 < 0 ? NB_AVATARS - 1 : avatarIndex - 1
            )
          }
        />
        <img
          className="avatar-right-arrow"
          src={IMGS['rightArrow']}
          alt="right-arrow-img"
          onClick={() => setAvatarIndex((avatarIndex + 1) % NB_AVATARS)}
        />
        <input
          placeholder="Entrez votre nom..."
          type="text"
          onChange={(event) => setName(event.target.value)}
        />
        <Link
          onClick={() => onCreateLobby()}
          to={name.length !== 0 ? `/game?room=${room}` : '/'}
        >
          <button type="submit"> CREER UN SALON </button>
        </Link>
      </div>
    )
  }

  const onRedirectGithub = () => {
    window.location = 'https://github.com/Gajenthran'
  }

  const onReturnHome = () => {
    window.location = '/'
  }

  const renderFooter = () => {
    return (
      <div className="home--footer">
        <p onClick={() => onRedirectGithub()}> GITHUB </p>
      </div>
    )
  }

  return (
    <>
      <div className="home-screen">
        <div className="div-home">
          <div className="home--container">
            <div className="home--title" onClick={() => onReturnHome()}>
              <h3> Faux-Ami </h3>
              <img src={IMGS['pin']} alt="pin" />
            </div>
            {renderAvatar()}
            {renderFooter()}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
