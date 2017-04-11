import * as React from "react";

import { Panel } from "react-bootstrap";
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';

import { User, PublicUser } from "../../../common/models/User";

export interface UserScoreboardProps {
    users: PublicUser[];
    title: string;
    clickUser?: (user: PublicUser) => void;
}

export function UserScoreboard(props: UserScoreboardProps) {
    const disabled = !props.clickUser;
    const sorted = props.users.sort((user1, user2) => {
        if (user2.points === user1.points) {
            return user1.display.localeCompare(user2.display);
        }
        return user2.points - user1.points;
    });
    const items: JSX.Element[] = [];

    for (let i = 0; i < sorted.length; i++) {
        const user = sorted[i];
        items.push(<ListItem key={user.key}
            onClick={() => { props.clickUser && props.clickUser(user); }}
            primaryText={`${i + 1}   ${user.display}`}
            leftAvatar={<Avatar src={user.imageUrl}></Avatar>}
            rightIcon={<div>{user.points}</div>}
            disabled={disabled}>
            </ListItem>);
        items.push(<Divider key={i} inset={true}></Divider>);
    }
    return <Panel header={props.title}>
        <List>
            {items}
        </List>
    </Panel>;
}