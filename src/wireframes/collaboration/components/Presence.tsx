/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar } from 'antd';
import * as React from 'react';
import { usePresence } from '../hooks';

export const Presence = () => {
    const presence = usePresence();

    const sortedUsers = React.useMemo(() => {
        const result = Object.values(presence);

        result.sort((a, b) => {
            return a.initial.localeCompare(b.initial);
        });

        return result;
    }, [presence]);

    return (
        <Avatar.Group>
            {sortedUsers.map(user =>
                <Avatar key={user.id} style={{ backgroundColor: user.color }}>
                    {user.initial}
                </Avatar>,
            )}
        </Avatar.Group>
    );
};