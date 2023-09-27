document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Asign value to variables corresponding to the form fields value.
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  
}

function load_mailbox(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      
      emails.forEach(mail => {

        const parent_element = document.createElement("div");

        build_emails(mail, parent_element, mailbox);

        parent_element.addEventListener("click", () => read_email(item["id"]));
        document.querySelector("#emails-view").appendChild(parent_element);

      });
  });
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
      .then(result => {
        if ("message" in result) {
            // The email was sent successfully!
            load_mailbox('sent');
        }

        // if ("error" in result) {
        //     // There was an error in sending the email
        //     // Display the error next to the "To:"
        //     document.querySelector('#to-text-error-message').innerHTML = result['error']

        // }
        console.log(result);
        console.log("message" in result);
        console.log("error" in result);
      })
        .catch(error => {
            // we hope this code is never executed, but who knows?
            console.log(error);
        });
  return false;
}

function build_emails(item, parent_element, mailbox) {
  if (mailbox === "inbox" && item["archived"]) {
    return;
  }
  else if (mailbox === "archive" && !item["archived"]) {
    return;
  }

  const content = document.createElement("div");

  const recipients = document.createElement("strong");
  if (mailbox === "sent") {
    recipients.innerHTML = item["recipients"].join(", ") + " ";
  }
  else {
    recipients.innerHTML = item["sender"] + " ";
  }
  content.appendChild(recipients);

  content.innerHTML += item["subject"];

  // Set and style the date.
  const date = document.createElement("div");
  date.innerHTML = item["timestamp"];
  date.style.display = "inline-block";
  date.style.float = "right";

  if (item["read"]) {
    parent_element.style.backgroundColor = "grey";
    date.style.color = "black";
  } else {
    date.className = "text-muted";
  }
  content.appendChild(date);

  content.style.padding = "10px";
  parent_element.appendChild(content);


  // Style the parent element.
  parent_element.style.borderStyle = "solid";
  parent_element.style.borderWidth = "3px";
  parent_element.style.margin = "10px";
}
