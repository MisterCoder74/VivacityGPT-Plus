<?php
function uploadFile() {
$targetDir = "./upload/";
$targetFile = $targetDir . "source_file.txt";
$uploadOk = 1;
$fileType = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));

// Verifica se il file è un documento TXT
if ($fileType != "txt") {
echo "Sono consentiti solo file TXT.";
$uploadOk = 0;
}

// Verifica se ci sono errori durante il caricamento
if ($uploadOk == 0) {
echo "<b>Il tuo file non è stato caricato.</b><br>Assicurati che sia in formto TXT e che abbia massimo 17000 caratteri.";
} else {
if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFile)) {
echo "Il tuo file è stato caricato.<br>Fai click su 'Analizza file' per riassumerlo.";
} else {
echo "Si è verificato un errore.";
}
}
}

uploadFile();
?>