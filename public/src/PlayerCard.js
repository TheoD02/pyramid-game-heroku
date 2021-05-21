import {Avatar, Card, CardHeader, Grid} from '@material-ui/core';

export default function PlayerCard(props)
{
    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar aria-label="recipe">
                        {props.playerName.substring(0, 1).toUpperCase()}
                    </Avatar>
                }
                title={props.playerName + (props.isHost ? ' (hôte partie)' : '')}
            />
        </Card>
    );
}