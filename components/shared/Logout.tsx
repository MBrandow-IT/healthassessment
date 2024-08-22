"use client"

import React from 'react'
import { Button } from '../ui/button'
import { handleLogout } from '@/actions/auth.actions'

const Logout = () => {
  const handleClick = async () => {
    await handleLogout()
      .then(() => {
        window.location.reload();
      })
  }
  return (
    <Button onClick={handleClick}>Logout</Button>
  )
}

export default Logout