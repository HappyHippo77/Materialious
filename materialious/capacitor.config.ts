import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'us.materialio.app',
	appName: 'Materialious',
	webDir: 'build',
	plugins: {
		CapacitorNodeJS: {
			nodeDir: 'nodejs-android'
		}
	},
	server: {
		hostname: 'www.youtube.com',
		androidScheme: 'https'
	}
};

export default config;
