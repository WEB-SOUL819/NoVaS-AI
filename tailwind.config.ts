
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				nova: {
					'100': '#E0EAFF',
					'200': '#C7D7FF',
					'300': '#A5BDFF',
					'400': '#8AA4FF',
					'500': '#6987FF',
					'600': '#4361EE',
					'700': '#3B4FD9',
					'800': '#303DC4',
					'900': '#242B9F',
				},
				purple: {
					'100': '#F2E6FF',
					'200': '#E4CCFF',
					'300': '#D1ADFF',
					'400': '#BC8CFF',
					'500': '#A86AFF',
					'600': '#9747FF',
					'700': '#7209B7',
					'800': '#5E07A0',
					'900': '#4B0589',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-opacity': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'wave': {
					'0%': { transform: 'scaleY(0.2)' },
					'50%': { transform: 'scaleY(1)' },
					'100%': { transform: 'scaleY(0.2)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px 2px rgba(74, 109, 255, 0.4)' },
					'50%': { boxShadow: '0 0 12px 5px rgba(74, 109, 255, 0.7)' }
				},
				'rotate-circle': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-opacity': 'pulse-opacity 1.5s infinite ease-in-out',
				'wave-1': 'wave 1.2s infinite ease-in-out 0.1s',
				'wave-2': 'wave 1.2s infinite ease-in-out 0.2s',
				'wave-3': 'wave 1.2s infinite ease-in-out 0.3s',
				'wave-4': 'wave 1.2s infinite ease-in-out 0.4s',
				'wave-5': 'wave 1.2s infinite ease-in-out 0.5s',
				'glow': 'glow 2s infinite ease-in-out',
				'rotate-circle': 'rotate-circle 10s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
