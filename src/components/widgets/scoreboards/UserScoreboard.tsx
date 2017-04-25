import * as React from "react";

import { Panel } from "react-bootstrap";
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';
import NavigationArrowDropUp from 'material-ui/svg-icons/navigation/arrow-drop-up';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import { grey500, red500, green500 } from 'material-ui/styles/colors';

import { User } from "../../../../common/models/User";
import { PublicUser } from "../../../../common/responses/PublicUser";

export interface UserScoreboardProps {
    users: PublicUser[];
    title: string;
    clickUser?: (user: PublicUser) => void;
}

export function UserScoreboard(props: UserScoreboardProps) {
    const disabled = !props.clickUser;
    const sorted = props.users.sort((user1, user2) => {
        return user1.position - user2.position;
    });
    const items: JSX.Element[] = [];
    for (let i = 0; i < sorted.length; i++) {
        const user = sorted[i];
        let icon: JSX.Element;
        if (user.positionChange > 0) {
            icon = <NavigationArrowDropUp viewBox={"0 0 24 16"} style={{width: "30px"}} color={green500}></NavigationArrowDropUp>;
        }
        else if (user.positionChange < 0) {
            icon = <NavigationArrowDropDown viewBox={"0 0 24 16"} style={{width: "30px"}} color={red500}></NavigationArrowDropDown>;
        }
        else {
            icon = <ContentRemove viewBox={"0 0 24 10"} color={grey500}></ContentRemove>;
        }
        items.push(<ListItem key={user.key}
            onClick={() => { props.clickUser && props.clickUser(user); }}
            primaryText={<div>{icon}{<span>{`  ${user.display} (${user.numCorrectPicks} correct)`}</span>}</div>}
            leftAvatar={<Avatar style={{top: ""}} src={user.imageUrl}></Avatar>}
            rightIcon={<div style={{top: ""}}>{user.points}</div>}
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