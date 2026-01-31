import { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useInternetIdentity } from './useInternetIdentity';
import type { _SERVICE } from '../backend';

let actorCache: Actor | null = null;

export function useActor() {
  const { identity } = useInternetIdentity();
  const [actor, setActor] = useState<Actor | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function createActor() {
      if (!identity) {
        setActor(null);
        setIsFetching(false);
        return;
      }

      try {
        // Use cached actor if available
        if (actorCache) {
          setActor(actorCache);
          setIsFetching(false);
          return;
        }

        const canisterId = process.env.CANISTER_ID_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai';
        const host = process.env.DFX_NETWORK === 'local' 
          ? 'http://127.0.0.1:8080' 
          : 'https://icp-api.io';

        const agent = new HttpAgent({
          identity,
          host,
        });

        // For local development, fetch root key
        if (process.env.DFX_NETWORK === 'local') {
          await agent.fetchRootKey();
        }

        // Import actor from generated declarations
        const { createActor: createBackendActor } = await import('../backend');
        const backendActor = createBackendActor(canisterId, {
          agent,
        });

        actorCache = backendActor as any;
        setActor(backendActor as any);
        setIsFetching(false);
      } catch (error) {
        console.error('Failed to create actor:', error);
        setActor(null);
        setIsFetching(false);
      }
    }

    createActor();
  }, [identity]);

  return { actor: actor as _SERVICE | null, isFetching };
}
