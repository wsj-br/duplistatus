# Prabandhak Khata Punarprapti {#admin-account-recovery}

Jab aap apna password bhool jaate hain ya apne khate se lock ho jaate hain to **duplistatus** tak prabandhak pahunch ko punarprapt karein. Yah margdarshika Docker pariveshon mein prabandhak punarprapti script ka upyog karne ko shamil karti hai.

## Docker mein Script ka Upyog {#using-the-script-in-docker}

Dockerfile mein `scripts` directory aur ek suvidhajanak shell wrapper shamil hai.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Udaharan:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Samasya Nivaran {#troubleshooting}

Yadi aapko punarprapti script mein samasyaen aati hain:

1. **Container ke chalne ki Pusti Karein**: Jaanch karein ki container `docker ps` ke saath chal raha hai
2. **Script ki Uplabdhata ki Jaanch Karein**: Pusti karein ki script container mein `docker exec -it duplistatus ls -la /app/admin-recovery` ke saath maujood hai
3. **Container Logs ki Samiksha Karein**: `docker logs duplistatus` ke saath trutiyon ke liye jaanch karein
4. **Username ki Pusti Karein**: Sunishchit karein ki username database mein maujood hai
5. **Password Format ki Jaanch Karein**: Sunishchit karein ki naya password sabhi avashyaktaon ko pura karta hai

Yadi samasyaen bani rahti hain, to adhik sahayata ke liye [Samasya Nivaran](troubleshooting.md) margdarshika dekhein.
