/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { User } from '@app/wireframes/user';
import { useAwareness } from './../hooks';

type UserInfo =  { user: User; zoom: number; cursor?: { x: number; y: number; matchKey?: string | null | undefined } };

export interface CursorsProps {
    // A key that must match to show the cursors.
    matchKey: string | null | undefined;

    // The current zoom level.
    zoom: number;
}

export const Cursors = (props: CursorsProps) => {
    const { matchKey, zoom } = props;
    const awareness = useAwareness();
    const cursorsDiv = React.useRef<HTMLDivElement | null>(null);
    const currentKey = React.useRef<string | null | undefined>(matchKey);
    const currentZoom = React.useRef(0);

    currentKey.current = matchKey;
    currentZoom.current = zoom;

    React.useEffect(() => {
        awareness?.setLocalStateField('zoom', zoom);
    }, [awareness, zoom]);

    React.useEffect(() => {
        awareness?.setLocalStateField('cursor', undefined);
    }, [awareness, matchKey]);

    React.useEffect(() => {
        const moveHandler = (event: MouseEvent) => {
            if (!cursorsDiv.current) {
                return;
            }

            const rect = cursorsDiv.current.getBoundingClientRect();

            const x = event.pageX - rect.left; 
            const y = event.pageY - rect.top;
    
            awareness?.setLocalStateField('cursor', { x, y, matchKey: currentKey.current });
        };

        window.addEventListener('mousemove', moveHandler);

        return () => {
            window.removeEventListener('mousemove', moveHandler);
        };
    }, [awareness]);

    React.useEffect(() => {
        if (!awareness) {
            return () => {};
        }

        const handler = () => {
            const cursorDiv = cursorsDiv.current;

            if (!cursorDiv) {
                return;
            }

            const usersWithCursor: UserInfo[] = [];

            awareness.getStates().forEach((state, id) => {
                if (Object.keys(state).length > 0 && id !== awareness.clientID) {
                    const user = state as UserInfo;

                    if (user.cursor && user.zoom && user.cursor.matchKey === currentKey.current) {
                        usersWithCursor.push(user);
                    }
                }
            });

            if (usersWithCursor.length === 0) {
                return;
            }

            while (cursorDiv.children.length < usersWithCursor.length) {
                cursorDiv.insertAdjacentHTML('afterbegin', CURSOR_CODE);
            }

            const zoom = currentZoom.current;

            usersWithCursor.forEach(({ user, cursor, zoom: userZoom }, i) => {
                const element = cursorDiv.children.item(i) as HTMLElement;

                const x = (cursor!.x / userZoom) * zoom;
                const y = (cursor!.y / userZoom) * zoom;

                element.style.fill = user.color;
                element.style.top = `${y}px`;
                element.style.left = `${x}px`;
            });

            for (let i = usersWithCursor.length; i < cursorDiv.children.length; i++) {
                const element = cursorDiv.children.item(i) as HTMLElement;

                element.style.display = 'none';
            }
        };

        awareness.on('change', handler);

        handler();

        return () => {
            awareness.off('change', handler);
        };
    }, [awareness]);
    
    return (
        <div className='cursors' ref={cursorsDiv} style={{ pointerEvents: 'none' }} />
    );
};

const CURSOR_CODE = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" style="position: absolute">
        <path d="M 9 3 A 1 1 0 0 0 8 4 L 8 21 A 1 1 0 0 0 9 22 A 1 1 0 0 0 9.796875 21.601562 L 12.919922 18.119141 L 16.382812 26.117188 C 16.701812 26.855187 17.566828 27.188469 18.298828 26.855469 C 19.020828 26.527469 19.340672 25.678078 19.013672 24.955078 L 15.439453 17.039062 L 21 17 A 1 1 0 0 0 22 16 A 1 1 0 0 0 21.628906 15.222656 L 9.7832031 3.3789062 A 1 1 0 0 0 9 3 z"></path>
    </svg>
`;