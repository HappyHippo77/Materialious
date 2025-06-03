import { goto } from '$app/navigation';
import { interfaceAllowInsecureRequests } from '$lib/store';
import { Capacitor } from '@capacitor/core';

const originalFetch = window.fetch;
const corsProxyUrl: string = 'http://localhost:3000/';

function needsProxying(target: string): boolean {
	if (!target.startsWith('http')) return false;
	return true;
}

export const androidFetch = async (
	requestInput: string | URL | Request,
	requestOptions?: RequestInit
): Promise<Response> => {
	const uri = requestInput instanceof Request ? requestInput.url : requestInput.toString();

	if (needsProxying(uri)) {
		if (requestInput instanceof Request) {
			requestInput = new Request(corsProxyUrl + uri, {
				method: requestInput.method,
				headers: requestInput.headers,
				body: requestInput.body,
				mode: requestInput.mode,
				credentials: requestInput.credentials,
				cache: requestInput.cache,
				redirect: requestInput.redirect,
				referrer: requestInput.referrer,
				integrity: requestInput.integrity,
				keepalive: requestInput.keepalive,
				...(requestInput.body ? { duplex: 'half' } : {})
			});
		} else {
			requestInput = corsProxyUrl + uri;
		}
	}

	// Use the original fetch with the proxied URL and options
	return originalFetch(requestInput, requestOptions);
};

if (Capacitor.getPlatform() === 'android') {
	window.fetch = androidFetch;

	const originalXhrOpen = XMLHttpRequest.prototype.open;

	XMLHttpRequest.prototype.open = function (...args: any[]): void {
		if (needsProxying(args[1])) {
			args[1] = corsProxyUrl + args[1];
		}
		/* @ts-ignore */
		return originalXhrOpen.apply(this, args);
	};

	// Used to toggle rejectUnauthorized in the backend
	interfaceAllowInsecureRequests.subscribe(async (isAllowed) => {
		if (isAllowed) {
			await fetch('http://materialious__allow-insecure-requests');
		} else {
			await fetch('http://materialious__deny-insecure-requests');
		}
	});

	setTimeout(() => goto('/', { replaceState: true }), 100);
}
