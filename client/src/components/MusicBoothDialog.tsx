import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Game from '../scenes/Game'
import phaserGame from '../PhaserGame'
import { useAppSelector, useAppDispatch } from '../hooks'
import { closeMusicBoothDialog } from '../stores/MusicBoothStore'
import axios from 'axios'
import { useSnapshot } from 'valtio';
import { playlistStore } from '../stores/PlaylistStore'

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  max-width: 400px;
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
  margin:0px;
  width: 100%;
  height: 100%;
`

export default function MusicBoothDialog() {
  const musicBoothUrl = useAppSelector((state) => state.musicBooth.musicBoothUrl)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  console.log('musicBoothUrl', musicBoothUrl)

  const handlePlay = () => {
    console.log('handlePlay')
    game.network.startMusicShare('234234')
  }

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
        {/* {musicBoothUrl && ( */}
        <MusicBoothWrapper>
          <button onClick={handlePlay}>PLAY SONG</button>
          <MusicSearch />
        </MusicBoothWrapper>
        {/* )} */}
      </Wrapper>
    </Backdrop>
  )
}

const InputWrapper = styled.form`
  box-shadow: 10px 10px 10px #00000018;
  border: 1px solid #42eacb;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  background: linear-gradient(180deg, #000000c1, #242424c0);
`

const InputTextField = styled(InputBase)`
  border-radius: 10px;
  input {
    padding: 5px;
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

  useEffect(() => {
      console.log('PLAYLIST STORE URL', url);
     axios.get(`http://localhost:2567/youtube/${inputValue}`).then((response) => {
      
      setData(response?.data?.items)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  console.log('data', data);

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setInputValue('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const handleClick = (url:string) => {
      playlistStore.url = url;
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
        ref={inputRef}
        fullWidth
        placeholder="Search"
        value={inputValue}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
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
  color: #eee;
  flex-direction: row;
  border-bottom:1px solid grey;
  justify-content: space-between;

  h4 {
      color: #eee;
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