# Prabandhak Khata Punyuhar {#admin-account-recovery}

Prabandhak **duplistatus** ka prabandhak pratisthapan karne ke liye, jab aap apna password ghum gaye ho ya apne khate se bahar ho gaye ho. Yeh gaid Docker visheshak par prabandhak punyuhar script ka istemal karne ka vishleshan deti hai.

## Docker mein Script ka Istemal {#using-the-script-in-docker}

Dockerfile mein `scripts` directory aur ek suvidha shell wrapper shamil hai.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**उदाहरण:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## {#troubleshooting} के लिए समस्या निवारण

Agar aap prabandhak punyuhar script ke saath masalayon ka samna karte hain:

1. **Verify Container is Running**: Check that the container is running with `docker ps`
2. **Check Script Availability**: Verify the script exists in the container with `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Review Container Logs**: Check for errors with `docker logs duplistatus`
4. **Verify Username**: Ensure the username exists in the database
5. **Check Password Format**: Ensure the new password meets all requirements

Agar masalayon bharosayi rahenge, toh aur madad ke liye [Troubleshooting](troubleshooting.md) gaid dekhiye.
