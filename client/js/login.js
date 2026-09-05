function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async(event) => {
    event.preventDefault();

    message.textContent = "Accesso in corso...";
    message.className = "form-message";

    const credenziali = {
        email: document.getElementById("email").value, 
        password: document.getElementById("password").value
};

try{
    const response = await fetch("/api/auth/login", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
           },
           body: JSON.stringify(credenziali)  
     });

     const risultato = await response.json(); 
if(!response.ok){
    throw new Error(risultato.message); 
     }

     message.textContent = risultato.message; 
     message.className = "form-message success-message";

     loginForm.reset();
     setTimeout(() => {
        window.location.href = "dashboard.html"; 
}, 800); 
       } catch (error) {
        message.textContent = messaggioErrore(error);
        message.className = "form-message error-message";
    }
}); 
    