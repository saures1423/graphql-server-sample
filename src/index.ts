import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import db from './_db.js';

import { typeDefs } from './schema.js';

interface Args {
	id: string;
}

interface AddGamesArgs {
	game: {
		title: string;
		platform: string[];
	};
}

interface EditGamesArgs {
	id: string;
	edits: {
		title?: string;
		platform?: string[];
	};
}

const resolvers = {
	Query: {
		games() {
			return db.games;
		},

		game(_: unknown, args: Args) {
			return db.games.find((game) => game.id === args.id);
		},

		authors() {
			return db.authors;
		},

		author(_: unknown, args: Args) {
			return db.authors.find((author) => author.id === args.id);
		},

		reviews() {
			return db.reviews;
		},
		review(_: unknown, args: Args) {
			return db.reviews.find((review) => review.id === args.id);
		},
	},
	Mutation: {
		deleteGame(_: unknown, args: Args) {
			db.games = db.games.filter((game) => game.id !== args.id);
			return db.games;
		},
		addGame(_: unknown, args: AddGamesArgs) {
			const newGame = {
				...args.game,
				id: Math.floor(Math.random() * 10000).toString(),
			};
			db.games.push(newGame);

			return newGame;
		},
		updateGame(_: unknown, args: EditGamesArgs) {
			db.games = db.games.map((game) => {
				if (game.id === args.id) {
					return { ...game, ...args.edits };
				}

				return game;
			});

			return db.games.find((game) => game.id === args.id);
		},
	},

	Game: {
		reviews(parent: { id: string }) {
			return db.reviews.filter((review) => review.game_id === parent.id);
		},
	},

	Author: {
		reviews(parent: { id: string }) {
			return db.reviews.filter((review) => review.author_id === parent.id);
		},
	},

	Review: {
		game(parent: { game_id: string }) {
			return db.games.find((game) => game.id === parent.game_id);
		},
		author(parent: { author_id: string }) {
			return db.authors.find((author) => author.id === parent.author_id);
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const { url } = await startStandaloneServer(server, {
	listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
