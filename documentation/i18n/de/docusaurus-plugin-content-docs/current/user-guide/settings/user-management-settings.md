# Benutzer {/* #users */}

Verwalten Sie Benutzerkonten, Berechtigungen und Zugriffskontrolle für **duplistatus**. In diesem Abschnitt können Administratoren Benutzerkonten erstellen, ändern und löschen.

![Benutzerverwaltung](../../assets/screen-settings-users.png)

>[!TIP] 
>Das Standard-`admin`-Konto kann gelöscht werden. Gehen Sie dazu wie folgt vor: Erstellen Sie einen neuen Admin-Benutzer, melden Sie sich mit diesem Konto an und löschen Sie dann das `admin`-Konto.
>
> Das Standardpasswort für das `admin`-Konto lautet `Duplistatus09`. Sie werden aufgefordert, es beim ersten Anmelden zu ändern.

## Zugriff auf die Benutzerverwaltung {/* #accessing-user-management */}

Sie können auf die Benutzerverwaltung in zwei verschiedenen Weisen zugreifen:

1. **Über das Benutzermenü**: Klicken Sie auf <IconButton icon="lucide:user" label="Benutzername" /> in der [Anwendungssymbolleiste](../overview.md#application-toolbar) und wählen Sie "Admin-Benutzer".

2. **Über die Einstellungen**: Klicken Sie auf <IconButton icon="lucide:settings"/> und **Benutzer** in der Einstellungsseite

## Erstellen eines neuen Benutzers {/* #creating-a-new-user */}

1. Klicken Sie auf die <IconButton icon="lucide:plus" label="Benutzer hinzufügen"/>-Schaltfläche
2. Geben Sie die Benutzerdetails ein:
   - **Benutzername**: Muss 3-50 Zeichen lang sein, einzigartig und groß-/kleinschreibung unberücksichtigt
   - **Admin**: Aktivieren Sie diese Option, um Administratorrechte zu gewähren
   - **Passwortänderung erzwingen**: Aktivieren Sie diese Option, um eine Passwortänderung beim ersten Anmelden zu erzwingen
   - **Passwort**: 
     - Option 1: Aktivieren Sie "Passwort automatisch generieren", um ein sicheres temporäres Passwort zu erstellen
     - Option 2: Deaktivieren Sie diese Option und geben Sie ein benutzerdefiniertes Passwort ein
3. Klicken Sie auf <IconButton icon="lucide:user-plus" label="Benutzer erstellen" />.

## Bearbeiten eines Benutzers {/* #editing-a-user */}

1. Klicken Sie auf das <IconButton icon="lucide:edit" />-Bearbeitungssymbol neben dem Benutzer
2. Ändern Sie eines der folgenden Elemente:
   - **Benutzername**: Ändern Sie den Benutzernamen (muss einzigartig sein)
   - **Admin**: Schalten Sie die Administratorrechte um
   - **Passwortänderung erzwingen**: Schalten Sie die Passwortänderung um
3. Klicken Sie auf <IconButton icon="lucide:check" label="Änderungen speichern" />.

## Zurücksetzen eines Benutzerpassworts {/* #resetting-a-user-password */}

1. Klicken Sie auf das <IconButton icon="lucide:key-round" />-Schlüsselsymbol neben dem Benutzer
2. Bestätigen Sie das Zurücksetzen des Passworts
3. Ein neues temporäres Passwort wird generiert und angezeigt
4. Kopieren Sie das Passwort und geben Sie es dem Benutzer sicher weiter

## Löschen eines Benutzers {/* #deleting-a-user */}

1. Klicken Sie auf das <IconButton icon="lucide:trash-2" />-Löschsymbol neben dem Benutzer
2. Bestätigen Sie das Löschen im Dialogfeld. **Das Löschen eines Benutzers ist dauerhaft und kann nicht rückgängig gemacht werden.**

## Kontosperrung {/* #account-lockout */}

Konten werden automatisch gesperrt, nachdem mehrere Anmeldeversuche fehlgeschlagen sind:
- **Sperrschwelle**: 5 fehlgeschlagene Versuche
- **Sperrdauer**: 15 Minuten
- Gesperrte Konten können sich nicht anmelden, bis die Sperrdauer abgelaufen ist

## Admin-Zugriff wiederherstellen {/* #recovering-admin-access */}

Wenn Sie Ihr Admin-Passwort verloren haben oder von Ihrem Konto gesperrt wurden, können Sie den Zugriff mit dem Admin-Wiederherstellungsskript wiederherstellen. Siehe die Anleitung [Admin-Konto-Wiederherstellung](../admin-recovery.md) für detaillierte Anweisungen zur Wiederherstellung des Administratorzugriffs in Docker-Umgebungen.

Wenn der Browser **Zugriff verweigert** (HTTP 403) anzeigt, bevor das Anmeldeformular erscheint, verwenden Sie stattdessen [Durch IP-Zulassungsliste gesperrt](../troubleshooting.md#locked-out-by-ip-allowlist).
