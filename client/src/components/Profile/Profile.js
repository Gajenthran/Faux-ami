import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import queryString from 'query-string'

import socket from './../../config/socket'

import './../Home/Home.css'
import { userAvatar, NB_AVATARS } from './../Home'

/**
 * Home component to create an user and a lobby.
 * There is also game rules.
 */
const Profile = ({ location }) => {
  const [name, setName] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const { room } = queryString.parse(location.search)

  const onJoinLobby = () => {
    const user = { name, img: userAvatar.avatars[avatarIndex] }
    if (name.length !== 0) socket.emit('lobby:join', { user, room })
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
            onClick={() => onJoinLobby()}
            to={name.length !== 0 ? `/game?room=${room}` : '/'}
          >
            <button className="button mt-20" type="submit">
              {' '}
              REJOINDRE LE SALON{' '}
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
          <Link to={'/'}>
            <h3 className="home--title"> Faux-Ami </h3>
          </Link>
          {renderAvatar()}
          {renderFooter()}
        </div>
        </div>
      </div>
    </>
  )
}

export default Profile
