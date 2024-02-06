#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
#SingleInstance, force
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

:*:_mcq::
SendRaw, \question[]
Send, {Enter}
SendRaw, \begin{choices}
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \end{choices}
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
return

:*:_saq::
SendRaw, \question[]
Send, {Enter}
SendRaw, \vspace{0.5in}
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
return

:*:_fitb::
SendRaw, \question[] \rule{3cm}{0.15mm}.
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
return

:*:_tf::
SendRaw, \question[] True or False - . If this statement is false, modify it to make it true.
Send, {Enter}
SendRaw, \vspace{0.5in}
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
return

; -------------------------------------------------

:*:_pmcq::
SendRaw, \part[]
Send, {Enter}
SendRaw, \begin{choices}
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \choice
Send, {Enter}
SendRaw, \end{choices}
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Right}
Send, {Right}
Send, {Right}
Send, {Right}
Send, {Right}
Send, {Right}
return

:*:_psaq::
SendRaw, \part[]
Send, {Enter}
SendRaw, \vspace{0.5in}
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Up}
Send, {Right}
Send, {Right}
Send, {Right}
Send, {Right}
Send, {Right}
Send, {Right}
return

:*:_pfitb::
SendRaw, \part[] \rule{3cm}{0.15mm}.
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
return

:*:_ptf::
SendRaw, \part[] True or False - . If this statement is false, modify it to make it true.
Send, {Enter}
SendRaw, \vspace{0.5in}
Send, {Enter}
SendRaw, \begin{solution}
Send, {Enter}
SendRaw, \end{solution}
Send, {Enter}
return