(function blackjackModule() {	// start local scope - Blackjack

'use strict';
var deck = [],
    dealBlocked = false,
    hitBlocked = true,
    standBlocked = true,
    firstTime = true;
/* audio declaration and settings */
var backgroundSound = new Audio("audio/background.mp3"),
    cardDealingSound = new Audio("audio/cardDealing.mp3"),
    cardShuffle = new Audio("audio/cardShuffling.mp3");
backgroundSound.volume = 0.15;
backgroundSound.loop = true;
cardShuffle.volume = 0.6;
// creating Card constructor
function Card(rank, suit) {
	this.rank = rank;
	this.suit = suit;
	this.img = "img/" + rank + suit.charAt(0) + ".svg";
	if (typeof this.rank === 'number') {
		this.value = this.rank;
	} else if (this.rank === 'A') {
		this.value = 11;
	} else this.value = 10;
}
// creating deck as array of Card objects. numOfDecks represent the amount of decks used to create the whole deck to Blackjack.
function createDeck() {
	var ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
	var suits = ['Heart', 'Spade', 'Club', 'Diamond'];
	var numOfDecks = 5;
	var numOfCards = ranks.length * suits.length;
	for (var n = 0; n < numOfDecks; n++) {
		for (var s = 0; s < suits.length; s++) {
			for (var r = 0; r < ranks.length; r++) {
				deck[n * numOfCards + s * ranks.length + r] = new Card(ranks[r], suits[s]);
			}
		}
	}
	return deck;
}
// creating Player constructor
function Player(type) {
	this.type = type;
	this.score = 0;
	this.aceCount = 0;
}
Player.prototype = {
	addCard: function addCard(x) {
		cardDealingSound.play();
		if (x === 'backCard') {
			$('#dealerCards').append("<img src='img/back.svg'>");
			return;
		}
		var cardToAdd = deck.splice(randomCard(), 1)[0];
		$('#' + this.type + 'Cards').append("<img src='" + cardToAdd.img + "'>");
		this.calcScore(cardToAdd);
	},
	calcScore: function calcScore(cardToAdd) {
		this.score += cardToAdd.value;
		if (cardToAdd.rank === 'A') {
			this.aceCount++;
		}
		if (this.score > 21 && this.aceCount > 0) {
			this.aceCount--;
			this.score -= 10;
		}
		$('#' + this.type + 'Points').html(this.score);
		if (player.score > 21) {
			this.message();
		}
	},
	message: function message(x) {
		if (x === 'checkBlackjack') {
			if (player.score === 21) {
				$('#message').html('Blackjack!<br>You won');
				toggleButtons();
			}
			return;
		} else if (player.score > 21) {
			$('#message').html('Dealer won<br>You bust!');
		} else if (dealer.score > 21) {
			$('#message').html('Dealer bust!<br>You won');
		} else if (player.score === dealer.score) {
			$('#message').html('Push :)');
		} else if (player.score > dealer.score) {
			$('#message').html('Dealer lost<br>You won!');
		} else {
			$('#message').html('Dealer won!<br>You lost');
		}
		toggleButtons();
	}
};
function deal() {
	if (dealBlocked) {
		// deal button disabled
		return;
	}
	// sets 230 intentionally to show shuffle animation; should be like 30 by default
	if (deck.length < 230) {
		createDeck();
		shuffle();
		return;
	}
	// show text and score area after clicking 'deal' first time
	if (firstTime) {
		firstTime = false;
		$('.info, .score').css('visibility', 'visible');
	}
	reset();
	dealBlocked = !dealBlocked;
	dealer.addCard();
	// interval in dealing cards, not showing all cards instantly
	var delay = function delay(ms) {
		return new Promise(function (resolve) {
			return setTimeout(resolve, ms);
		});
	};
	delay(400).then(function () {
		return dealer.addCard('backCard');
	}).then(function () {
		return delay(400);
	}).then(function () {
		return player.addCard();
	}).then(function () {
		return delay(400);
	}).then(function () {
		player.addCard();
		dealBlocked = !dealBlocked;
		toggleButtons();
	}
	// checking if player got the blackjack from start. If so the wins instantly.
	);player.message('checkBlackjack');
}
function hit() {
	if (hitBlocked) {
		// hit button disabled
		return;
	}
	player.addCard();
}
function stand() {
	if (standBlocked) {
		// stand button disabled
		return;
	}
	standBlocked = !standBlocked;
	$('#dealerCards').children().last().remove();
	// interval in dealing cards, not showing all cards instantly
	var dealing = setInterval(function () {
		if (dealer.score <= 16) {
			dealer.addCard();
		} else {
			clearInterval(dealing);
			dealer.message();
			standBlocked = !standBlocked;
		}
	}, 400);
}
function randomCard() {
	return Math.floor(Math.random() * deck.length);
}
// clears the the points and result text message, resets score and ace count from previous game
function reset() {
	dealer.score = 0;
	player.score = 0;
	dealer.aceCount = 0;
	player.aceCount = 0;
	$('#dealerCards, #playerCards').html('');
	$('#message').html('');
	$('#dealerPoints, #playerPoints').html('');
}
// turns on/off particular buttons; disables them when needed
function toggleButtons() {
	dealBlocked = !dealBlocked;
	hitBlocked = !hitBlocked;
	standBlocked = !standBlocked;
}
// sets the background music and toggle play/pause when 'sound' icon is clicked
function backgroundMusic() {
	var backSound = true;
	backgroundSound.play();
	$('#soundIcon').on('click', toggleMusic);
	function toggleMusic() {
		backSound ? backgroundSound.pause() : backgroundSound.play();
		backSound = !backSound;
		$('#soundIcon').toggleClass('fa-volume-up fa-volume-off');
	}
}
// shuffle deck animation; starts with creating new deck when cards in previous deck < 230
function shuffle() {
	cardShuffle.play();
	reset();
	dealBlocked = true;
	firstTime = true;
	$('.info, .score').css('visibility', 'hidden');
	$('#message').html('Shuffling the deck...');
	var counter = 0;
	var cardInterval = setInterval(function () {
		var img = $('<img src="img/back.svg">');
		$('#dealerCards, #playerCards').append(img);
		counter++;
		if (counter === 6) {
			$('#dealerCards, #playerCards').html('');
		} else if (counter === 12) {
			$('#dealerCards, #playerCards').html('');
			$('#message').html("Let's play again!<br>Click: Deal");
			dealBlocked = false;
			clearInterval(cardInterval);
		}
	}, 500);
}
// creating player and dealer object
var dealer = new Player('dealer');
var player = new Player('player');
$(document).ready(function () {
	$('#deal').on('click', deal);
	$('#hit').on('click', hit);
	$('#stand').on('click', stand);
	createDeck();
	backgroundMusic();
	});
})(); // end local scope - Blackjack