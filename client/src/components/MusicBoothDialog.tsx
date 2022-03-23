import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Fab from '@mui/material/Fab'
import Game from '../scenes/Game'
import phaserGame from '../PhaserGame'
import { useAppSelector, useAppDispatch } from '../hooks'
import { openMusicBoothDialog, closeMusicBoothDialog, setFocused } from '../stores/MusicBoothStore'
import axios from 'axios'
import { useSnapshot } from 'valtio';
import { playlistStore } from '../stores/PlaylistStore'
import { playlistStore2 } from '../stores/PlaylistStore'

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 50vh;
  background: transparent;
  overflow: hidden;
  max-width: 400px;
  padding: 16px 16px 16px 16px;
`
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #eee;
  border-radius: 16px;
  padding: 0;
  color: #eee;
  display: flex;
  flex-direction: column;

  .close {
    margin: 0 0 0 auto;
    padding: 0;
  }
`

const MusicBoothWrapper = styled.div`
  flex: 1;
  border-radius: 0px;
  border-top: 1px solid #aaa;
  overflow: hidden;
  padding: 5px 5px;
  width: 100%;
  height: 100%;
`

const FabWrapper = styled.div`
  button {
    font-size: 14px;
    color: #666;
    text-transform: lowercase !important;
    line-height: 100%;
    background-color: white !important;
  }

`
export default function MusicBoothDialog() {
  const musicBoothUrl = useAppSelector((state) => state.musicBooth.musicBoothUrl)
  const showMusicBoothDialog = useAppSelector((state) => state.musicBooth.musicBoothDialogOpen)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  console.log('musicBoothUrl', musicBoothUrl)

  const handlePlay = () => {
    console.log('handlePlay')
    game.network.startMusicShare('234234')
  }

  return (
    <Backdrop>
    {showMusicBoothDialog ? (
      <Wrapper>
          <>
            <div style={{display: 'flex', alignItems: 'center', padding: '2px 5px'}}>
              <h3 style={{margin: '5px 0', flexGrow: 1, textAlign: 'center', color: '#888', fontSize: '16px'}}>My Playlist</h3>
              <IconButton
                aria-label="close dialog"
                className="close"
                onClick={() => dispatch(closeMusicBoothDialog())}
              >
                <CloseIcon />
              </IconButton>
            </div>
            {/* {musicBoothUrl && ( */}
            <MusicBoothWrapper>
              <MusicSearch />
            </MusicBoothWrapper>
            {/* )} */}
          </>)
      </Wrapper>)
      :
        (
          <div style={{textAlign: 'right'}}>
          <FabWrapper>
            <Fab
              color="secondary"
              aria-label="showMusicBooth"
              onClick={() => {
                dispatch(openMusicBoothDialog('1'))
                dispatch(setFocused(true))
              }}
            >
              My Playlist
            </Fab>
          </FabWrapper>
          </div>
        )
      }
    </Backdrop>
  )
}

const InputWrapper = styled.form`
  border: 1px solid #42eacb;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
`

const InputTextField = styled(InputBase)`
  border-radius: 10px;
  input {
    padding: 5px;
    color: #222;
  }
`

const SearchList =styled.ul`
  padding:0px;
  margin:0px;
`

const MusicSearch = () => {
  const [data, setData] = useState([])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { url } = useSnapshot(playlistStore);
  const dispatch = useAppDispatch()
  const focused = useAppSelector((state) => state.musicBooth.focused)
  const game = phaserGame.scene.keys.game as Game

  useEffect(() => {
      console.log('PLAYLIST STORE URL', url);
     axios.get(`http://localhost:2567/youtube/${inputValue}`).then((response) => {
      
      setData(response?.data?.items)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus()
    }
  }, [focused])

  console.log('data', data);

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    inputRef.current?.blur()
    setInputValue('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("/////////////handleKeyDown")
    if (event.key === 'Escape') {
      inputRef.current?.blur()
      dispatch(closeMusicBoothDialog())
    }
  }

  const handleClick = (url:string) => {
      playlistStore.url = url;
      playlistStore2.set.current(url);
      game.network.startMusicShare(url);
  }

  const resultsList = data?.length > 0 && data?.map( result => {
      const { title, thumbnail, length, id} = result;
      return (
          <YoutubeResult onClick={()=>handleClick(id)} key={id} title={title} thumbnail={thumbnail} length={length} id={id} />
      )
  })

  return (
      <section>
    <InputWrapper onSubmit={handleSubmit}>
      <InputTextField
        inputRef={inputRef}
        autoFocus={focused}
        fullWidth
        placeholder="Search"
        value={inputValue}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onFocus={() => {
          if (!focused) dispatch(setFocused(true))
        }}
        onBlur={() => dispatch(setFocused(false))}
      />
    </InputWrapper>

    <SearchList>

    {resultsList}

    </SearchList>

    </section>
  )
}


const ListItem = styled.li`
  border-radius: 0px;
  padding: 10px;
  display: flex;
  color: #666;
  flex-direction: row;
  border-bottom:1px solid grey;
  justify-content: space-between;

  h4 {
      color: #666;
  }
`

const YoutubeResult = ({id, thumbnail, title, length, onClick}) => {

    const lengthText = length?.simpleText;

    return(
        <ListItem onClick={onClick}>
            <section>
                <h4>{title}</h4>
            </section>
            <section>
                {lengthText}
            </section>

        </ListItem>

    );
}