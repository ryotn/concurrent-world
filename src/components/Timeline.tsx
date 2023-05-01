import React from 'react';
import { Paper, List, Divider } from '@mui/material';
import { Tweet } from './Tweet'
import { IuseObjectList } from '../hooks/useObjectList';
import { StreamElement, RTMMessage, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';

export interface TimelineProps {
    address: string;
    messages: IuseObjectList<StreamElement>;
    userDict: IuseResourceManager<User>;
    messageDict: IuseResourceManager<RTMMessage>;
    clickAvatar: (userid: string) => void;
    favorite: (messageID: string | undefined, deletekey?: string) => void;
    inspect: (message: RTMMessage | null) => void;
}

export function Timeline(props: TimelineProps) {
    return (<>
        <Paper sx={{display: 'flex', flex: 1}}>
            <List sx={{flex: 1}}>
            {props.messages.current.map(e =>
                <React.Fragment key={e.ID}>
                    <Tweet 
                        message={props.messageDict.get(e.Values.id)}
                        favorite={props.favorite}
                        address={props.address}
                        userDict={props.userDict}
                        inspect={props.inspect}
                        clickAvatar={() => {
                            //props.clickAvatar(e.author)
                        }}/>
                    <Divider variant="inset" component="li" sx={{margin: '0 5px'}} />
                </React.Fragment>
            )}
            </List>
        </Paper>
    </>);
}
