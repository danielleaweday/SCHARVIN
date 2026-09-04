Option Explicit

If WScript.Arguments.Count <> 2 Then
  WScript.Echo "Usage: cscript //nologo render-with-word.vbs input.docx output.pdf"
  WScript.Quit 2
End If

Dim word, document, inputPath, outputPath
inputPath = WScript.Arguments(0)
outputPath = WScript.Arguments(1)

On Error Resume Next
Set word = CreateObject("Word.Application")
If Err.Number <> 0 Then
  WScript.Echo "Unable to start Microsoft Word: " & Err.Description
  WScript.Quit 3
End If

word.Visible = False
word.DisplayAlerts = 0
Set document = word.Documents.Open(inputPath, False, True, False)
If Err.Number <> 0 Then
  WScript.Echo "Unable to open DOCX: " & Err.Description
  word.Quit
  WScript.Quit 4
End If

' 17 = wdExportFormatPDF
document.ExportAsFixedFormat outputPath, 17
If Err.Number <> 0 Then
  WScript.Echo "Unable to export PDF: " & Err.Description
  document.Close False
  word.Quit
  WScript.Quit 5
End If

document.Close False
word.Quit
WScript.Echo "Rendered " & outputPath
