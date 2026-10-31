/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { sizeInPx, ViewBox } from '@app/core';
import { useCollaboration } from './hooks';
import { user as currentUser, User } from './user';
import './Cursors.scss';

// Limits the awareness updates, because each update is sent to all other users.
const CURSOR_THROTTLE_MS = 50;

const CURSOR_FIELD = 'cursor';

type CursorLocal = { diagramId: string; x: number; y: number };
type CursorRemote = CursorLocal & { clientId: number; user: User };

export interface CursorsProps {
    // The id of the selected diagram.
    diagramId: string;

    // The viewbox.
    viewBox: ViewBox;
}

export const Cursors = React.memo(({ diagramId, viewBox }: CursorsProps) => {
    const { awareness } = useCollaboration();
    const [cursors, setCursors] = React.useState<ReadonlyArray<CursorRemote>>([]);
    const container = React.useRef<HTMLDivElement>(null);
    const viewBoxRef = React.useRef(viewBox);

    viewBoxRef.current = viewBox;

    React.useEffect(() => {
        const host = container.current?.parentElement;

        if (!awareness || !host) {
            return undefined;
        }

        let lastSent = 0;

        const publish = (event: PointerEvent) => {
            const now = Date.now();

            if (now - lastSent < CURSOR_THROTTLE_MS) {
                return;
            }

            lastSent = now;

            const { left, top } = host.getBoundingClientRect();
            const { minX, minY, zoom } = viewBoxRef.current;

            const cursor: CursorLocal = {
                diagramId,
                x: (event.clientX - left) / zoom + minX,
                y: (event.clientY - top) / zoom + minY,
            };

            awareness.setLocalStateField(CURSOR_FIELD, cursor);
        };

        const hide = () => {
            awareness.setLocalStateField(CURSOR_FIELD, null);
        };

        host.addEventListener('pointermove', publish);
        host.addEventListener('pointerleave', hide);

        return () => {
            host.removeEventListener('pointermove', publish);
            host.removeEventListener('pointerleave', hide);
            hide();
        };
    }, [awareness, diagramId]);

    React.useEffect(() => {
        if (!awareness) {
            setCursors([]);
            return undefined;
        }

        const update = () => {
            const result: CursorRemote[] = [];

            awareness.getStates().forEach((state, clientId) => {
                const user = state['user'] as User | undefined;
                const cursor = state[CURSOR_FIELD] as CursorLocal | null | undefined;

                if (clientId !== awareness.clientID && user && user.id !== currentUser.id && cursor) {
                    result.push({ ...cursor, clientId, user });
                }
            });

            setCursors(result);
        };

        update();

        awareness.on('change', update);

        return () => {
            awareness.off('change', update);
        };
    }, [awareness]);

    return (
        <div className='cursors' ref={container}>
            {cursors.filter(x => x.diagramId === diagramId).map(({ clientId, user, x, y }) =>
                <div key={clientId} className='cursor'
                    style={{ left: sizeInPx((x - viewBox.minX) * viewBox.zoom), top: sizeInPx((y - viewBox.minY) * viewBox.zoom) }}>
                    <svg className='cursor-pointer' viewBox='0 0 16 16' width={16} height={16}>
                        <path d='M1 1 L1 13 L4.5 9.5 L7 15 L9 14 L6.5 8.5 L11.5 8.5 Z' fill={user.color} stroke='#fff' strokeWidth={1} />
                    </svg>

                    <span className='cursor-label' style={{ backgroundColor: user.color }}>
                        {user.initial}
                    </span>
                </div>,
            )}
        </div>
    );
});
