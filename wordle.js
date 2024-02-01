const get_word_URL = 'https://words.dev-apis.com/word-of-the-day';
const get_random_word_URL = 'https://words.dev-apis.com/word-of-the-day?random=1';
const validate_word_URL = 'https://words.dev-apis.com/validate-word';
const letters = document.querySelectorAll('.input-box');
const loadingDiv = document.querySelector('.load-div');
const ANSWER_LENGTH = 5;
const TOTAL_ROUNDS = 6;


let wordOfTheDay = '';
let currentRow = 0;


async function init(){
    let guess = '';
    let done = false;
    let isLoading = true;

    const res = await fetch(get_random_word_URL);
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split('');
    setLoading(false);
    isLoading = false;
    console.log(word);


    function addLetter(letter){

        if (guess.length < ANSWER_LENGTH) {
            guess += letter;
          } else {
            guess = guess.substring(0, guess.length - 1) + letter;
          }
      
          letters[ANSWER_LENGTH * currentRow + guess.length - 1].innerText = letter;
    
    }

    function backspace(){
        guess = guess.substring(0, guess.length - 1);
        letters[currentRow * ANSWER_LENGTH + guess.length].innerText = "";
    }

    async function commit(){
    if(guess.length !== ANSWER_LENGTH){
        return;
    }

    // TODO validate word
    isLoading = true;
    setLoading(true);
    const res = await fetch(validate_word_URL, {
        method: 'POST',
        body: JSON.stringify({word: guess})
    });
    const resObj = await res.json();
    const validWord = resObj.validWord;

    isLoading = false;
    setLoading(false);

    if(!validWord){
        markInvalidWord();
        return;
    }
    

    const guessParts = guess.split('');
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++){
        // mark as correct
        if(guessParts[i] === wordParts[i]){
            letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
            map[guessParts[i]]--;
        }
    }
    for (let i = 0; i < ANSWER_LENGTH; i++){
        if(guessParts[i] === wordParts[i]){
            // do nothing we already did it;
        } else if(wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
            // mark as close
            letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
            map[guessParts[i]]--;
        } else {
            // mark as wrong
            letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
        }
    }

    currentRow++;
    
    if(guess === word){
        document.querySelector(".page-title").classList.add("winner");
        done = true;
        return;
    } else if(currentRow === TOTAL_ROUNDS){
        alert(`YOU LOSE, THE WORD WAS ${word}`);
        done = true;
    }

    guess = '';

    }

    function markInvalidWord() {
        for (let i = 0; i < ANSWER_LENGTH; i++) {
          letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
    
          // long enough for the browser to repaint without the "invalid class" so we can then add it again
          setTimeout(
            () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"),
            10
          );
        }
      }
    


    document.addEventListener("keydown", function handleKeyPress(event) {

        if(done || isLoading){
            return;
        }

        const action = event.key;
        if (action === "Enter") {
          commit();
        } else if (action === "Backspace") {
          backspace();
        } else if (isLetter(action)) {
          addLetter(action.toUpperCase());
        }
      });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }

function setLoading(isLoading){
loadingDiv.classList.toggle('hidden', !isLoading);
}

function makeMap(array){
    const obj = {};
    for (let i =1; i<array.length; i++){
        const letter = array[i]
        if(obj[letter]){
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }

    return obj;
}

init();
