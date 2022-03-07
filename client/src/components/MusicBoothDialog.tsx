import React from 'react'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import { useAppSelector, useAppDispatch } from '../hooks'
import { closeMusicBoothDialog } from '../stores/MusicBoothStore'

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  max-width:400px;
  padding: 16px 16px 16px 16px;
`
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #222639;
  border-radius: 16px;
  padding: 16px;
  color: #eee;
  position: relative;
  display: flex;
  flex-direction: column;

  .close {
    position: absolute;
    top: 16px;
    right: 16px;
  }
`

const MusicBoothWrapper = styled.div`
  flex: 1;
  border-radius: 25px;
  overflow: hidden;
  margin-right: 50px;
  iframe {
    width: 100%;
    height: 100%;
  }
`

export default function MusicBoothDialog() {
  const musicBoothUrl = useAppSelector((state) => state.musicBooth.musicBoothUrl)
  const dispatch = useAppDispatch()

  return (
    <Backdrop>
      <Wrapper>
        <IconButton
          aria-label="close dialog"
          className="close"
          onClick={() => dispatch(closeMusicBoothDialog())}
        >
          <CloseIcon />
        </IconButton>
        {musicBoothUrl && (
          <MusicBoothWrapper>
            <iframe title="white board" src={musicBoothUrl} />
          </MusicBoothWrapper>
        )}
      </Wrapper>
    </Backdrop>
  )
}
