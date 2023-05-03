import { useState, useContext } from "react";
import { TextField, Box, Stack, Button } from "@mui/material";
import { Sign } from '../util'
import { ApplicationContext } from '../App';
import SendIcon from '@mui/icons-material/Send';

export function Draft(props: any) {

  const appData = useContext(ApplicationContext)

  const [draft, setDraft] = useState<string>("");

  const post = () => {
    const payload_obj = {
      'body': draft
    }
    const payload = JSON.stringify(payload_obj)
    const signature = Sign(appData.privatekey, payload)

    console.log(appData)

    const requestOptions = {
      method: 'POST',
      headers: {},
      body: JSON.stringify({
        author: appData.userAddress,
        payload: payload,
        signature: signature,
        streams: props.currentStreams
      })
    };

    fetch(appData.serverAddress + 'messages', requestOptions)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setDraft("");
        props.reload();
      });
  }

  return <Stack sx={{ position: 'relative' }}>
    <TextField multiline rows={6} label="message" variant="outlined" value={draft} onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e: any) => {
        if ((draft.length == 0) || (draft.trim().length == 0)) return
        if (e.key == 'Enter' && e.ctrlKey == true) {
          post()
        }
      }}
    />
    <Box sx={{
      position: 'absolute',
      bottom: 10,
      right: 10
    }}>
      <Button
        color="primary"
        variant="contained"
        disabled={(draft.length == 0) || (draft.trim().length == 0)}
        onClick={_ => post()}
        endIcon={<SendIcon />}
      >
        Send
      </Button>
    </Box>
  </Stack>
}
