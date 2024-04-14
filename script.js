// "Enter" Key verifications
function verifyEnter(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendMessage();
  }
}

function verifyEnterIMG(event) {
  // Verifica se il pulsante premuto è Invio
  if (event.keyCode === 13) {
    event.preventDefault(); // Previeni il comportamento predefinito del form
    // Esegui lo script JavaScript qui
    generateImage();
  }
}

// Functions to open the modals
function openTXT() {
  const modal = document.getElementById("openTXTmodal"); // Get the modal element
  modal.style.display = "block"; // Show the modal
}

function openIMG() {
  const modal = document.getElementById("openIMGmodal"); // Get the modal element
  modal.style.display = "block"; // Show the modal
}

function openPDF() {
  const modal = document.getElementById("openPDFmodal"); // Get the modal element
  modal.style.display = "block"; // Show the modal
}

// Functions to close the modals
function closeTXTmodal() {
  const modal = document.getElementById("openTXTmodal");
  modal.style.display = "none";
}

function closeIMGmodal() {
  const modal = document.getElementById("openIMGmodal");
  modal.style.display = "none";
}
function closePDFmodal() {
  const modal = document.getElementById("openPDFmodal");
  modal.style.display = "none";
}

// Chat Search function
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", searchChat);
function searchChat() {
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput.value.trim().toLowerCase();

  const messageElements = document.querySelectorAll(
    "#chat-container .user-message, #chat-container .chatgpt-message"
  );

  messageElements.forEach((messageElement) => {
    const messageText = messageElement.innerText.toLowerCase();
    if (messageText.includes(searchTerm)) {
      messageElement.style.display = "block";
      messageElement.innerText = messageText;
    } else {
      messageElement.style.display = "none";
    }
  });

  searchInput.value = "";
}

//Save Chat Function
var saveButtont = document.getElementById("savetxt");
saveButtont.addEventListener("click", handleSaveButtontClick);

function handleSaveButtontClick() {
  saveChatContentTxt();
}

function saveChatContentTxt() {
  var chatContent = document.getElementById("chat-container").innerText;

  chatContent = chatContent.replace(/Copy/g, "");

  var currentTimestamp = new Date();
  var datetime = currentTimestamp.toISOString();
  var filename = "chatsession_v" + datetime.replace(/[-:.]/g, "");

  var blob = new Blob([chatContent], { type: "text/plain" });

  var url = URL.createObjectURL(blob);

  var downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = filename + ".txt";
  downloadLink.click();
  URL.revokeObjectURL(url);
}

// INIZIO JAVASCRIPT COMUNICAZIONE CON OPENAI TEXT E TXT ANALYZER

let chatMemory = [];
// Definistion of structure for context memory
function createMemory(messages) {
  const memory = [];
  for (const msg of messages) {
    memory.push({ role: msg.role, content: msg.content });
  }
  return memory;
}

// function to send the message
async function sendMessage() {
  const apikey = document.getElementById("apikeyfield01").value; //apikeyfield01 is for di OpenAI

  if (apikey === "") {
    alert("Check the Setup panel - No OpenAI API Key found.");
  } else {
    console.log(apikey);

    const inputElement = document.getElementById("user-input");
    const userInput = inputElement.value.trim();
    if (userInput !== "") {
      showMessage("Guest", userInput, "");
      chatMemory = await getChatGPTResponse(userInput, chatMemory);

      inputElement.value = "";
    }
  }
}

// Handle the Copy button
function handleCopyButtonClick(event) {
  event.preventDefault();
  const text = this.dataset.message;
  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

// Show the message in the chat container
function showMessage(sender, message, tokens) {
  const chatContainer = document.getElementById("chat-container");
  const chatSection = document.querySelector(".chathistory");
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator && sender === "VivacityGPT") {
    chatContainer.removeChild(typingIndicator);
  }

  // Create new message eleents
  // Show number of tokens only if sender IS NOT the user
  const messageElement = document.createElement("div");
  if (sender !== "Guest") {
    const separator = document.createElement("p");
    separator.innerHTML = `${tokens}`;
    messageElement.innerText = `${sender}: ${message}`;
    messageElement.appendChild(separator);
  } else {
    messageElement.innerText = `${sender}: ${message}`;
  }
  //

  // style correctly according to the sender
  if (sender === "Guest") {
    messageElement.classList.add("user-message");
  } else if (sender === "VivacityGPT") {
    messageElement.classList.add("chatgpt-message");

    // Copy button is added to the message
    const copyButton = document.createElement("button");
    copyButton.innerText = "Copy";
    copyButton.style.float = "right";
    copyButton.classList.add("btncopy");
    copyButton.dataset.message = message;
    copyButton.addEventListener("click", handleCopyButtonClick);
    messageElement.appendChild(copyButton);
  }

  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Fuction to interrogate OpenAI model and get response (TXT chatbot - simple chat)
async function getChatGPTResponse(userInput, chatMemory = []) {
  const chatContainer = document.getElementById("chat-container");
  const typingIndicator = document.createElement("p");
  typingIndicator.id = "typing-indicator";
  typingIndicator.innerHTML =
    '<img src="preloader.gif" class="preloader" alt="Loading...">'; // need to have this gif in your folder
  chatContainer.appendChild(typingIndicator);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        Authorization: "Bearer " + apikey
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",
        messages: [...chatMemory, { role: "user", content: userInput }]
      })
    });
    if (!response.ok) {
      throw new Error("Error while requesting to the API");
    }
    const data = await response.json();
    if (
      !data.choices ||
      !data.choices.length ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("Invalid API response");
    }

    const chatGPTResponse = data.choices[0].message.content.trim();
    const responseTokens = data.choices[0].message.total_tokens;
    var cleanResponse = chatGPTResponse.replace(
      /(```html|```css|```javascript|```php|```python|```vb|cpp|java|csharp)(.*?)/gs,
      "$2"
    );
    cleanResponse = cleanResponse.replace(/```/g, "");

    // manages token from the response
    const tokenCount = document.createElement("p");

    // Verifica che "completion_tokens" sia presente nella struttura degli oggetti restituiti dalla tua API
    if (data.usage.completion_tokens) {
      const responseTokens = data.usage.completion_tokens;


      tokenCount.innerHTML = `<br><hr><br>Used tokens: ${responseTokens}`;
    } else {
      tokenCount.innerHTML = "Unable to track the number of used tokens.";
    }

    showMessage("VivacityGPT", cleanResponse, tokenCount.innerHTML);

    // adds response to memory context
    chatMemory.push({ role: "user", content: userInput });
    chatMemory.push({ role: "assistant", content: cleanResponse });

    // updates context memory
    return chatMemory;
  } catch (error) {
    console.error(error);
    // manage errors with a warning
    alert(
      "An error occurred during the request. Check your OpenAI account or retry later."
    );
  }
}

// manage file analyzing
async function analyzeFile() {
  chatMemory = []; // initializes memory
  try {
    const fileURL = "upload/source_file.txt";
    const response = await fetch(fileURL);
    if (response.ok) {
      const fileContent = await response.text();
      if (fileContent.length <= 17000) {
        console.log(fileContent);
        if (fileContent.length <= 17000) {
          chatMemory = await resetAndAnalyze(fileContent, chatMemory);
        }
      } else {
        alert(
          "The file content is over 17000 chars. The request will be discarded."
        );
      }
    } else {
      console.error("Error accessing the content of file: ", fileURL);
    }
  } catch (error) {
    console.error("An error occurred: ", error);
  }
}

async function resetAndAnalyze(fileContent, chatMemory) {
  return await getChatGPTResponseTXT(
    "Summarize this content: " + fileContent,
    chatMemory
  );
}

// Fuction to interrogate OpenAI model and get response (TXT chatbot - TXT summarizer)
async function getChatGPTResponseTXT(fileContent, chatMemory = []) {
  const chatContainer = document.getElementById("chat-container");
  const typingIndicator = document.createElement("p");
  typingIndicator.id = "typing-indicator";
  typingIndicator.innerHTML =
    '<img src="preloader.gif" class="preloader" alt="Loading...">';
  chatContainer.appendChild(typingIndicator);
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",
        messages: [
          ...chatMemory.map((item) => ({ ...item })),
          { role: "user", content: "Summarize this file: " + fileContent }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("Error while requesting to the API.");
    }

    const data = await response.json();
    if (
      !data.choices ||
      !data.choices.length ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("Invalid API response.");
    }

    const chatGPTResponse = data.choices[0].message.content;


    // tokens management from response
    const tokenCount = document.createElement("p");

    if (data.usage.completion_tokens) {
      const responseTokens = data.usage.completion_tokens;

      tokenCount.innerHTML = `<br><hr><br>Used tokens: ${responseTokens}`;
    } else {
      tokenCount.innerHTML = "Unable to retrieve the number of used tokens.";
    }

    showMessage(
      "VivacityGPT",
      "Here is a summary of the analyzed file: \n\n" +
      chatGPTResponse +
      "\n\n Now you can ask me questions about the content.",
      tokenCount.innerHTML
    );
    // updates memory with the received response
    chatMemory.push({ role: "user", content: fileContent });
    chatMemory.push({ role: "assistant", content: chatGPTResponse });

    // updates emory context
    return chatMemory;
  } catch (error) {
    console.error(error);
    // error handling
    alert(
      "An error occurred suring the request. Check your OpenAI account or try later."
    );
  }
}

// Function to set the persnality depending on the select list
function updateStructure() {
  var selectElement = document.getElementById("selectOption");
  var selectedValue = selectElement.value;
  console.log(getDefinition(selectedValue));
  chatMemory = createMemory([
    {
      role: "system",
      content: getDefinition(selectedValue)
    }
  ]);
}

function getDefinition(selectedValue) {
  switch (selectedValue) {
    case "01":
      return "You are a full stack developer working for a Web Agency. You will always start your answers by introducing yourself, using a random name between Alex and Liliana. You will also change your communication language tone according to the selected name: Alex is a balanced person with a fresh communication tone and concise and polite language, while Liliana is very verbose and illustrative in her communication and uses a lot of punctuation. You will always end your answers with a greeting and thanking for the question received.";
    case "02":
      return "You are a .NET developer working for a Web Agency. You are specialized in the creation of programs and apps with the .NET framework by Microsoft, especially using VB.NET and C#, but also ASP technology and F#. You will always start your answers by introducing yourself, using a random name between Alex and Filomena. You will also change your communication language tone according to the selected name: Alex is a balanced person with a vivid communication tone and polite language, while Filomena is a verbose and illustrative person. You will always end your answers with a greeting and thanking for the question received.";
    case "03":
      return "You are a web developer working for a Web Agency. You are specialized in Wordpress website building and customizing, but also in the use of Elementor and in Wordpress  hosting. You will always start your answers by introducing yourself as Marco. Your personality is very informal. You will always end your answers thanking for the question received.";
    case "04":
      return "You are a Javascript / JSON / Ajax developer working for a Web Agency. You are specialized in the use of Javascript frameworks, particularly using React, Vue and Angular. You are also skilled in using javascript libraries and NodeJS for the backend. You are sensitive to the use of JSON instead of relational databases.  You will always start your answers by introducing yourself as Liliana. Your personality is very friendly. You will always end your answers thanking for the question received.";
    case "05":
      return "You are a fanatic of Retrocomputing, specialized in programming langauges of the past, like Pascal, TurboPascal, LISP, LOGO, various dialects of BASIC, and you have a general knowledge of the hardware and software of the '80s. You are also specialized in microcomputing and home computing, with particular reference to Commodore computers, their environments and languages.";
    case "06":
      return "You are an heavy metal guitar player with a huge knowledge of hard rock, rock, heavy metal and all genres of the kind; you can write detailled reviews about rock, hard rock, and heavy metal artists, band, and players.";
    case "07":
      return "You are a generic music expert who writes for a fictional magazine called Vivacity Music Style, your name is Alex, and you have a wide and deep knowledge on all genres of music, particularly pop and rock of the '80s and '90s.";
    case "08":
      return "You are a movie expert, you love sci-fi and action movies, but your knowledge encompasses every kind of movies; you have a huge collection of movies and you can give your opinion on movies, their plots, and style. You can also provide biographies of the cast of every movie.";
    case "09":
      return "You are a TV Serials Expert, you love sci-fi and mystery tv serials, but your knowledge encompasses every kind of tv serial; you have a huge collection of serials and you can give your opinion on their plots and style. You can also provide biographies of the cast of every TV serial.";
    case "10":
      return "You are a multi languages skilled translator, and you can provide translation to and from many langauges. You will use a teachy conversation style and you can also provide alternative translations including idiomatics and slangs.";
    case "11":
      return "You are a 17th century poet, always answering to the questions using Old English and Poetical English; your conversational tone is pompous and verbose, like in a Shakespeare poem.";
    case "12":
      return "You are Papa Smurf, leader of the Smurfs. You are 546 years old and you have broad knowledge on all human sciences and literatures. You will talk like a smurf instead of like a human.";
    default:
      return "You are a Chatbot called VivacityGPT and you can answer about all topics. You will always suggest to select one of your multiple personalities to provide more detailled answers aout specific topics.";
  }
}

document
  .getElementById("selectOption")
  .addEventListener("change", updateStructure);

// FINE JAVASCRIPT COMUNICAZIONE CON OPENAI TEXT E TXT ANALYZER

// INIZIO JAVASCRIPT COMUNICAZIONE CON IMG CREATOR

async function generateImage() {
  const apikey = document.getElementById("apikeyfield01").value;
  console.log(apikey);
  const prompt = document.getElementById("user-inputIMG").value;
  const chatContainer = document.getElementById("chat-containerIMG");
  const promptDiv = document.createElement("div");
  promptDiv.classList.add("user-message");
  promptDiv.textContent = `Prompt: ${prompt}`;
  chatContainer.appendChild(promptDiv);

  const typingIndicator = document.createElement("p");
  typingIndicator.id = "typing-indicatorIMG";
  typingIndicator.innerHTML =
    '<img src="preloader.gif" class="preloader" alt="Loading...">';
  chatContainer.appendChild(typingIndicator);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apikey
        },
        body: JSON.stringify({
          model: "dall-e-2",
          prompt: prompt,
          n: 1,
          size: "512x512"
        })
      }
    );

    const data = await response.json();
    const imageUrl = data.data[0].url;

    const responseDiv = document.createElement("div");
    responseDiv.classList.add("chatgpt-message");
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "Generated Image";
    image.classList.add("generatedimg");
    responseDiv.appendChild(image);

    const downloadLink = document.createElement("a");
    const spacer = document.createElement("br");
    downloadLink.href = imageUrl;
    downloadLink.target = "_blank";
    downloadLink.textContent = "Download Image";
    responseDiv.appendChild(spacer);
    responseDiv.appendChild(downloadLink);

    chatContainer.removeChild(typingIndicator);
    chatContainer.appendChild(responseDiv);
  } catch (error) {
    console.error(error);
    alert(
      "An error occurred during the request. Check your OpenAI account or try later."
    );
  }
}

// FINE JAVASCRIPT COMUNICAZIONE CON IMG CREATOR

// INIZIO JAVASCRIPT COMUNICAZIONE CON CHATPDF E PDF ANALYZER

let sourceId = "";
const openModalLink = document.getElementById("openModalLink");
const modal = document.getElementById("modal");
const pdfURLInput = document.getElementById("pdfURLInput");
const uploadButton = document.getElementById("uploadButton");

// Event listener for opening the modal
openModalLink.addEventListener("click", function () {
  modal.style.display = "block";
});

// Event listener for uploading PDF from URL
uploadButton.addEventListener("click", function () {
  const pdfURL = pdfURLInput.value;
  uploadPDFFromURL(pdfURL);
  modal.style.display = "none";
});

function uploadPDF() {
  const apiUrl = "https://api.chatpdf.com/v1";
  const apiKey = document.getElementById("apikeyfield02").value; //apikeyfield02 is for ChatPDF
  console.log(apiKey);

  const fileInput = document.getElementById("pdfFileInput");
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("file", file);

  fetch(`${apiUrl}/sources/add-file`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    },
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      sourceId = data.sourceId;
      console.log("PDF uploaded. Source ID:", sourceId);
      document.getElementById("Feedback").textContent =
        "PDF uploaded successfully.";
      document.getElementById("Feedback").style.display = "block";
    })
    .catch((error) => console.error("Error uploading PDF:", error));
}

function uploadPDFFromURL(pdfURL) {
  const apiUrl = "https://api.chatpdf.com/v1";
  const apiKey = document.getElementById("apikeyfield02").value;
  console.log(apiKey);

  const data = {
    url: pdfURL
  };

  fetch(`${apiUrl}/sources/add-url`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      sourceId = data.sourceId;
      console.log("PDF uploaded from URL. Source ID:", sourceId);
      document.getElementById("Feedback").textContent =
        "PDF uploaded successfully.";
      document.getElementById("Feedback").style.display = "block";
    })
    .catch((error) => console.error("Error uploading PDF from URL:", error));
}

function deletePDF() {
  const apiUrl = "https://api.chatpdf.com/v1";
  const apiKey = document.getElementById("apikeyfield02").value;
  console.log(apiKey);

  if (!sourceId) {
    console.error("Please upload a PDF first.");
    return;
  }

  fetch(`${apiUrl}/sources/delete`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sources: [sourceId] })
  })
    .then(() => {
      console.log("PDF deleted successfully.");
      sourceId = "";
      document.getElementById("Feedback").textContent =
        "PDF deleted successfully.";
      document.getElementById("Feedback").style.display = "block";
    })
    .catch((error) => console.error("Error deleting PDF:", error));
}

function sendQuestion() {
  const apiUrl = "https://api.chatpdf.com/v1";
  const apiKey = document.getElementById("apikeyfield02").value;
  console.log(apiKey);
  const questionInput = document.getElementById("questionInput");
  const question = questionInput.value;
  responseDiv.innerHTML += "<p>" + question + "</p>";

  if (!sourceId) {
    console.error("Please upload a PDF first.");
    return;
  }

  const data = {
    referenceSources: true,
    mainPoints: true,
    questionExamples: true,
    sourceId: sourceId,
    messages: [
      {
        role: "user",
        content: question
      }
    ]
  };

  fetch(`${apiUrl}/chats/message`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      const responseDiv = document.getElementById("responseDiv");
      const response = document.createElement("p");
      response.innerText = data.content;
      responseDiv.appendChild(response);
      console.log(data.content);
      questionInput.value = "";
    })
    .catch((error) => console.error("Error sending question:", error));
}

// FINE JAVASCRIPT COMUNICAZIONE CON CHATPDF E PDF ANALYZER