import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import socket from './../../config/socket'

import './Home.css'

import Navbar from './../Navbar/Navbar'

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

/**
 * Home component to create an user and a lobby.
 * There is also game rules.
 */
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
          src={userAvatar.leftArrow}
          alt="left-arrow-img"
          onClick={() =>
            setAvatarIndex(
              avatarIndex - 1 < 0 ? NB_AVATARS - 1 : avatarIndex - 1
            )
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
          type="text"
          onChange={(event) => setName(event.target.value)}
        />
        <Link
          onClick={() => onCreateLobby()}
          to={name.length !== 0 ? `/game?room=${room}` : '/'}
        >
          <button className="button mt-20" type="submit">
            {' '}
            CREER UN SALON{' '}
          </button>
        </Link>
      </div>
    )
  }

  const renderFooter = () => {
    return (
      <div className="home--footer">
        <p> Github □ </p>
        <p> Gajenthran </p>
      </div>
    )
  }

  return (
    <>
      <div className="home-screen">
        <div className="div-home">
        <div className="home--container">
          <h3 className="home--title"> Faux-Ami </h3>
          {renderAvatar()}
          {renderFooter()}
        </div>
        </div>
      </div>
    </>
  )
}

export default Home
